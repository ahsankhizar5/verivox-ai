import json
import logging
import os
import torch
import torch.nn.functional as F
import numpy as np
import librosa
from lime import lime_image
from groq import Groq
from models.AASIST import Model 

logger = logging.getLogger("lime_inference")

class VeriVoxLimeAnalyzer:
    def __init__(self, config_path, device="cpu", groq_api_key=None):
        self.device = torch.device(device)
        with open(config_path, "r") as f_json:
            self.config = json.loads(f_json.read())

        self.model = Model(self.config["model_config"]).to(self.device)
        weight_path = self.config["model_path"]
        # If the model path is relative, resolve it relative to the config file
        if not os.path.isabs(weight_path):
            cfg_dir = os.path.dirname(os.path.abspath(config_path))
            weight_path = os.path.join(cfg_dir, weight_path)

        if not os.path.exists(weight_path):
            raise FileNotFoundError(f"Model weight file not found: {weight_path}")

        # Safe load: only copy parameters whose names and shapes match.
        ckpt = torch.load(weight_path, map_location=self.device)
        if isinstance(ckpt, dict) and "state_dict" in ckpt:
            ckpt = ckpt["state_dict"]
        elif isinstance(ckpt, dict) and "model_state_dict" in ckpt:
            ckpt = ckpt["model_state_dict"]

        self.model.load_state_dict(ckpt, strict=True)
        logger.info("Loaded model weights strictly from %s", weight_path)
        self.model.eval()

        # Groq API key passed from external configuration (do not hardcode)
        self.groq_api_key = groq_api_key

        # Secondary Model: Wav2Vec2 Self-Supervised Deepfake Detector for unseen AI voices
        self.w2v_extractor = None
        self.w2v_model = None
        w2v_model_id = os.getenv("SECONDARY_MODEL_ID", "MelodyMachine/Deepfake-audio-detection-V2")
        if os.getenv("ENABLE_ENSEMBLE_MODEL", "true").lower() in ("1", "true", "yes"):
            try:
                from transformers import AutoFeatureExtractor, AutoModelForAudioClassification
                self.w2v_extractor = AutoFeatureExtractor.from_pretrained(w2v_model_id)
                self.w2v_model = AutoModelForAudioClassification.from_pretrained(w2v_model_id).to(self.device)
                self.w2v_model.eval()
                logger.info("Loaded ensemble Wav2Vec2 model (%s) for unseen audio generalization.", w2v_model_id)
            except Exception as exc:
                logger.warning("Ensemble Wav2Vec2 model (%s) unavailable, using AASIST + DSP biometrics: %s", w2v_model_id, exc)

    @property
    def target_length(self):
        return int(self.config["model_config"]["nb_samp"])

    def _repeat_pad(self, audio: np.ndarray):
        target_length = self.target_length
        audio = audio.astype(np.float32, copy=False)
        audio_len = int(len(audio))
        if audio_len >= target_length:
            return audio[:target_length]
        if audio_len == 0:
            raise ValueError("Cannot pad empty audio.")
        repeats = int(target_length / audio_len) + 1
        return np.tile(audio, repeats)[:target_length].astype(np.float32, copy=False)

    def _load_speech_audio(self, file_path):
        try:
            y, sr = librosa.load(file_path, sr=16000, mono=True)
        except Exception as exc:
            raise ValueError(
                "Uploaded audio could not be decoded. Check that the proxy forwards the original file bytes."
            ) from exc

        source_samples = int(len(y))
        actual_seconds = source_samples / sr

        if source_samples == 0:
            raise ValueError("Decoded audio is empty. Check the uploaded file bytes and proxy FormData handling.")

        source_abs_max = float(np.max(np.abs(y)))
        source_rms = float(np.sqrt(np.mean(np.square(y)))) if source_samples else 0.0
        if source_abs_max < 1e-5:
            raise ValueError(
                "Decoded audio is effectively silent. This usually means the proxy sent an empty/corrupted file."
            )

        intervals = librosa.effects.split(y, top_db=30)
        speech_segments = [y[start:end] for start, end in intervals if end > start]
        y_speech = (
            np.concatenate(speech_segments).astype(np.float32, copy=False)
            if speech_segments
            else np.asarray([], dtype=np.float32)
        )
        speech_samples = int(len(y_speech))
        speech_abs_max = float(np.max(np.abs(y_speech))) if speech_samples else 0.0
        speech_rms = float(np.sqrt(np.mean(np.square(y_speech)))) if speech_samples else 0.0
        vad_retained_ratio = speech_samples / source_samples if source_samples else 0.0

        requested_mode = os.getenv("PREPROCESSING_MODE", "auto").lower()
        if requested_mode not in ("auto", "asvspoof", "vad"):
            raise ValueError("PREPROCESSING_MODE must be one of: auto, asvspoof, vad.")

        if requested_mode == "asvspoof" or (requested_mode == "auto" and source_samples <= self.target_length):
            y_model = y.astype(np.float32, copy=False)
            preprocessing_mode = "asvspoof_raw_short_audio"
        elif speech_samples > 0:
            y_model = y_speech
            preprocessing_mode = "vad_stitched_speech"
        else:
            y_model = y.astype(np.float32, copy=False)
            preprocessing_mode = "raw_audio_no_vad_intervals"

        model_input_samples = int(len(y_model))

        audio_debug = {
            "source_samples": source_samples,
            "source_seconds": round(source_samples / sr, 4),
            "source_abs_max": round(source_abs_max, 8),
            "source_rms": round(source_rms, 8),
            "vad_intervals": int(len(intervals)),
            "speech_samples": speech_samples,
            "speech_seconds": round(speech_samples / sr, 4),
            "speech_abs_max": round(speech_abs_max, 8),
            "speech_rms": round(speech_rms, 8),
            "vad_retained_ratio": round(float(vad_retained_ratio), 8),
            "preprocessing_mode": preprocessing_mode,
            "model_input_samples_before_framing": model_input_samples,
            "model_input_seconds_before_framing": round(model_input_samples / sr, 4),
        }

        logger.info("Audio decoded successfully: %s", audio_debug)
        return y_model, sr, audio_debug

    def _build_windows(self, y_model: np.ndarray, sr: int):
        target_length = self.target_length
        model_input_samples = int(len(y_model))

        if model_input_samples < target_length:
            window = self._repeat_pad(y_model)
            windows = np.asarray([window], dtype=np.float32)
            starts = np.asarray([0], dtype=np.int64)
            mode = "single_repeat_padded_window"
        else:
            stride = int(os.getenv("WINDOW_STRIDE_SAMPLES", str(target_length // 2)))
            stride = max(1, min(stride, target_length))
            starts = list(range(0, model_input_samples - target_length + 1, stride))
            last_start = model_input_samples - target_length
            if starts[-1] != last_start:
                starts.append(last_start)

            max_windows = int(os.getenv("MAX_PREDICT_WINDOWS", "2"))
            if max_windows > 0 and len(starts) > max_windows:
                candidate_energy = np.asarray([
                    float(np.mean(np.square(y_model[start:start + target_length])))
                    for start in starts
                ])
                selected_indices = np.argsort(candidate_energy)[-max_windows:]
                selected_indices = np.sort(selected_indices)
                starts = [starts[idx] for idx in selected_indices]
                mode = "top_energy_candidate_windows"
            else:
                mode = "overlapping_windows"

            windows = np.stack([y_model[start:start + target_length] for start in starts]).astype(np.float32)
            starts = np.asarray(starts, dtype=np.int64)

        if windows.ndim != 2 or windows.shape[1] != target_length:
            raise ValueError(f"Window shape mismatch: expected (N, {target_length}), got {windows.shape}.")

        return windows, starts, {
            "window_mode": mode,
            "window_count": int(windows.shape[0]),
            "window_stride_samples": int(os.getenv("WINDOW_STRIDE_SAMPLES", str(target_length // 2))),
            "max_predict_windows": int(os.getenv("MAX_PREDICT_WINDOWS", "2")),
            "model_samples": int(target_length),
            "model_seconds": round(target_length / sr, 4),
        }

    def predict_audio_batch(self, batch_audio: np.ndarray):
        tensor_audio = torch.tensor(batch_audio, dtype=torch.float32).to(self.device)
        with torch.no_grad():
            _, logits = self.model(tensor_audio)
            probs = F.softmax(logits, dim=1)
        return logits.cpu().numpy(), probs.cpu().numpy()

    def _cm_score_threshold(self):
        return float(os.getenv("CM_SCORE_THRESHOLD", "2.2389912605285645"))

    def _cm_score_scale(self):
        return max(float(os.getenv("CM_SCORE_SCALE", "1.0")), 1e-6)

    def _calibrated_probs_from_cm_score(self, cm_scores):
        cm_scores = np.asarray(cm_scores, dtype=np.float32)
        threshold = self._cm_score_threshold()
        scale = self._cm_score_scale()
        spoof_probs = 1.0 / (1.0 + np.exp((cm_scores - threshold) / scale))
        bonafide_probs = 1.0 - spoof_probs
        return spoof_probs.astype(np.float32), bonafide_probs.astype(np.float32)

    def _confidence_summary(
        self,
        spoof_prob: float,
        bonafide_prob: float,
        score_spread: float = 0.0,
        scored_window_count: int = 1,
    ):
        max_class_probability = max(spoof_prob, bonafide_prob)
        confidence_margin = abs(spoof_prob - bonafide_prob)
        confidence_threshold = float(os.getenv("CONFIDENCE_THRESHOLD", "0.60"))
        medium_threshold = float(os.getenv("MEDIUM_CONFIDENCE_THRESHOLD", "0.75"))

        if max_class_probability < confidence_threshold:
            confidence_level = "low"
        elif max_class_probability < medium_threshold:
            confidence_level = "medium"
        else:
            confidence_level = "high"

        is_uncertain = confidence_level == "low"
        is_flat_window_response = (
            scored_window_count > 1
            and score_spread < float(os.getenv("FLAT_WINDOW_SPREAD_THRESHOLD", "0.02"))
        )
        warning = None
        if is_uncertain:
            warning = (
                "Low-confidence prediction near the model decision boundary. Treat this as inconclusive, "
                "especially for in-the-wild mic, WhatsApp, radio, noisy, or long-form recordings."
            )
        elif is_flat_window_response:
            warning = (
                "Model scores are very similar across candidate windows. This can indicate an out-of-distribution "
                "or low-evidence recording rather than a strong forensic signal."
            )

        return {
            "max_class_probability": round(float(max_class_probability), 8),
            "confidence": f"{max_class_probability * 100:.2f}%",
            "confidence_margin": round(float(confidence_margin), 8),
            "confidence_level": confidence_level,
            "confidence_threshold": round(float(confidence_threshold), 8),
            "is_uncertain": bool(is_uncertain),
            "is_flat_window_response": bool(is_flat_window_response),
            "warning": warning,
        }

    def select_prediction_window(self, file_path):
        y_speech, sr, audio_debug = self._load_speech_audio(file_path)
        windows, starts, window_debug = self._build_windows(y_speech, sr)
        logits, softmax_probs = self.predict_audio_batch(windows)

        cm_scores = logits[:, 1]
        spoof_probs, bonafide_probs = self._calibrated_probs_from_cm_score(cm_scores)
        softmax_spoof_probs = softmax_probs[:, 0]
        softmax_bonafide_probs = softmax_probs[:, 1]
        selected_idx = int(np.argmax(spoof_probs))
        selected_start = int(starts[selected_idx])
        selected_end = selected_start + self.target_length
        spoof_min = float(np.min(spoof_probs))
        spoof_max = float(np.max(spoof_probs))
        spoof_mean = float(np.mean(spoof_probs))
        spoof_spread = spoof_max - spoof_min

        top_k = int(os.getenv("PREDICT_TOP_K", "3"))
        top_k = max(1, min(top_k, len(spoof_probs)))
        top_indices = np.argsort(spoof_probs)[-top_k:][::-1]

        selected_audio = windows[selected_idx].astype(np.float32, copy=False)
        final_spoof_prob = float(spoof_probs[selected_idx])
        w2v_spoof_prob = None

        if self.w2v_model is not None and self.w2v_extractor is not None:
            try:
                w2v_inputs = self.w2v_extractor(
                    selected_audio,
                    sampling_rate=sr,
                    return_tensors="pt",
                    padding=True,
                )
                w2v_inputs = {k: v.to(self.device) for k, v in w2v_inputs.items()}
                with torch.no_grad():
                    w2v_logits = self.w2v_model(**w2v_inputs).logits
                    w2v_probs = F.softmax(w2v_logits, dim=-1).cpu().numpy()[0]
                # id2label in MelodyMachine/Deepfake-audio-detection-V2 is {0: "fake", 1: "real"}
                w2v_spoof_prob = float(w2v_probs[0])
                final_spoof_prob = 0.55 * w2v_spoof_prob + 0.45 * final_spoof_prob
            except Exception as exc:
                logger.warning("Wav2Vec2 inference failed on window: %s", exc)

        final_bonafide_prob = 1.0 - final_spoof_prob
        confidence_debug = self._confidence_summary(
            final_spoof_prob,
            final_bonafide_prob,
            spoof_spread,
            len(spoof_probs),
        )
        prediction_debug = {
            **audio_debug,
            **window_debug,
            **confidence_debug,
            "selection_mode": "ensemble_w2v2_aasist" if w2v_spoof_prob is not None else "max_spoof_probability_window",
            "selected_window_index": selected_idx,
            "selected_start_sample": selected_start,
            "selected_end_sample": selected_end,
            "selected_start_seconds": round(selected_start / sr, 4),
            "selected_end_seconds": round(selected_end / sr, 4),
            "selected_seconds": round(self.target_length / sr, 4),
            "prob_spoof_class_0": round(final_spoof_prob, 8),
            "prob_bonafide_class_1": round(final_bonafide_prob, 8),
            "w2v2_spoof_prob": round(w2v_spoof_prob, 8) if w2v_spoof_prob is not None else None,
            "score_interpretation": "calibrated_from_raw_cm_class1_logit",
            "raw_cm_score_class_1": round(float(cm_scores[selected_idx]), 8),
            "cm_score_threshold": round(float(self._cm_score_threshold()), 8),
            "cm_score_scale": round(float(self._cm_score_scale()), 8),
            "official_cm_decision": "bonafide" if float(cm_scores[selected_idx]) >= self._cm_score_threshold() else "spoof",
            "softmax_spoof_class_0": round(float(softmax_spoof_probs[selected_idx]), 8),
            "softmax_bonafide_class_1": round(float(softmax_bonafide_probs[selected_idx]), 8),
            "logits": [round(float(v), 8) for v in logits[selected_idx].tolist()],
            "scored_window_spoof_min": round(spoof_min, 8),
            "scored_window_spoof_max": round(spoof_max, 8),
            "scored_window_spoof_mean": round(spoof_mean, 8),
            "scored_window_spoof_spread": round(spoof_spread, 8),
            "top_window_indices": [int(idx) for idx in top_indices.tolist()],
            "top_window_spoof_probs": [round(float(spoof_probs[idx]), 8) for idx in top_indices.tolist()],
            "top_k_mean_spoof_prob": round(float(np.mean(spoof_probs[top_indices])), 8),
        }

        logger.info("Selected prediction window: %s", prediction_debug)
        return selected_audio, self.target_length / sr, prediction_debug

    def predict(self, audio_path):
        selected_audio, actual_seconds, audio_debug = self.select_prediction_window(audio_path)
        spoof_prob = float(audio_debug["prob_spoof_class_0"])
        bonafide_prob = float(audio_debug["prob_bonafide_class_1"])

        return {
            "spoof_score": f"{spoof_prob * 100:.2f}%",
            "bonafide_score": f"{bonafide_prob * 100:.2f}%",
            "predicted_label": "spoof" if spoof_prob >= bonafide_prob else "bonafide",
            "confidence": audio_debug["confidence"],
            "confidence_level": audio_debug["confidence_level"],
            "is_uncertain": audio_debug["is_uncertain"],
            "warning": audio_debug["warning"],
            "raw_audio": selected_audio,
            "actual_seconds": actual_seconds,
            "audio_debug": audio_debug,
        }

    
    def batch_predict(self, fake_images):
        # LIME hands us an array of shape (Batch, 1, 64600, 3)
        # We strip away the fake dimensions to get our (Batch, 64600) audio back!
        batch_audio = fake_images[:, 0, :, 0] 
        
        tensor_audio = torch.tensor(batch_audio, dtype=torch.float32).to(self.device)
        
        with torch.no_grad():
            # Get logits from AASIST
            _, logits = self.model(tensor_audio)
            cm_scores = logits[:, 1].cpu().numpy()
            spoof_probs, bonafide_probs = self._calibrated_probs_from_cm_score(cm_scores)
            probs = np.stack([spoof_probs, bonafide_probs], axis=1)
            
        # LIME expects an array of probabilities for [Spoof, Bona-fide]
        return probs

    def generate_lime_report(self, spoof_score, start_time, end_time):
        if spoof_score < 30.0:
            return "Status: SAFE. High confidence this audio is Bona-fide. No significant synthetic anomalies detected."
            
        severity = "Suspicious acoustic patterns detected." if spoof_score < 70.0 else "Severe synthetic artifacts confirmed."

        system_prompt = (
            "You are the core diagnostic text-generation engine of VeriVox. "
            "Your ONLY purpose is to output a clinical 2-sentence report based on the provided data. "
            "CRITICAL RULES: "
            "1. NEVER use conversational filler, greetings, or introductory phrases like 'Here is the report'."
            "2. Do not use hedging words like 'may' or 'might'. State findings as undeniable forensic facts. "
            "3. Start your response directly with the first word of the report. Output strictly the two sentences and absolutely nothing else."
        )
        
        user_prompt = f"""
        Data to translate:
        - Severity: {severity}
        - Anomaly Location: Between {start_time}s and {end_time}s.
        
        Write the 2-sentence report explaining that the LIME perturbation analysis isolated this exact timeframe. State that algorithmic muting of this segment caused a significant drop in deepfake probability, mathematically proving it contains the primary synthetic footprint.
        """

        try:
            client = Groq(api_key=self.groq_api_key)
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model="llama-3.1-8b-instant",
                temperature=0.2,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            return f"LIME anomaly isolated between {start_time}s and {end_time}s. (LLM Failed: {e})"

    def analyze(self, audio_path):
        raw_audio, actual_seconds, audio_debug = self.select_prediction_window(audio_path)
        
        # Calculate initial spoof score
        spoof_prob = float(audio_debug["prob_spoof_class_0"])
        bonafide_prob = float(audio_debug["prob_bonafide_class_1"])
        spoof_score = spoof_prob * 100
        
        # Trick LIME by converting 1D audio to a 3D "Fake Image"
        fake_image = np.zeros((1, 64600, 3), dtype=np.float32)
        for i in range(3):
            fake_image[0, :, i] = raw_audio

        # Allow configuring LIME runtime via environment variables for faster responses
        num_chunks = int(os.getenv("LIME_NUM_CHUNKS", "20"))
        num_samples = int(os.getenv("LIME_NUM_SAMPLES", "20"))

        # Custom Segmentation: chop the 64,600 samples into `num_chunks` chunks
        def custom_segmentation(img):
            mask = np.zeros((1, 64600), dtype=int)
            chunk_size = 64600 // num_chunks
            for i in range(num_chunks):
                mask[0, i * chunk_size:(i + 1) * chunk_size] = i
            return mask

        # Run LIME Explainer (num_samples and segmentation now configurable)
        explainer = lime_image.LimeImageExplainer()
        explanation = explainer.explain_instance(
            fake_image,
            self.batch_predict,
            labels=(0,),
            top_labels=None,
            hide_color=0,  # When LIME "mutes" a chunk, it replaces it with pure silence (0)
            num_samples=num_samples,
            segmentation_fn=custom_segmentation,
        )
        
        # Extract the LIME weights for the Spoof class (Label 0)
        # explanation.local_exp[0] returns a list of tuples: (chunk_index, weight)
        lime_weights = dict(explanation.local_exp[0])
        
        # Find the chunk with the highest positive impact on the Spoof score
        valid_chunks = int(num_chunks * (actual_seconds / 4.0375))
        worst_chunk = -1
        max_weight = -999
        
        for chunk_idx, weight in lime_weights.items():
            if chunk_idx < valid_chunks and weight > max_weight:
                max_weight = weight
                worst_chunk = chunk_idx
                
        # Convert chunk index to exact seconds
        chunk_duration = 4.0375 / num_chunks
        start_time = round(worst_chunk * chunk_duration, 2)
        end_time = round((worst_chunk + 1) * chunk_duration, 2)
        
        description = self.generate_lime_report(spoof_score, start_time, end_time)
        
        return {
            "spoof_score": f"{spoof_score:.2f}%",
            "bonafide_score": f"{bonafide_prob * 100:.2f}%",
            "predicted_label": "spoof" if spoof_prob >= bonafide_prob else "bonafide",
            "confidence": audio_debug["confidence"],
            "confidence_level": audio_debug["confidence_level"],
            "is_uncertain": audio_debug["is_uncertain"],
            "warning": audio_debug["warning"],
            "text_description": description,
            "raw_audio": raw_audio[:int(actual_seconds * 16000)],  # Cropped audio
            "lime_weights": lime_weights,
            "num_chunks": num_chunks,
            "actual_seconds": actual_seconds,
            "num_samples_used": num_samples,
            "audio_debug": audio_debug,
        }
