package io.github.nitel.tcgscanner;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.text.TextRecognition;
import com.google.mlkit.vision.text.TextRecognizer;
import com.google.mlkit.vision.text.latin.TextRecognizerOptions;

/** On-device text recognition of an image passed in memory (ADR 016). */
@CapacitorPlugin(name = "CardOcr")
public class CardOcrPlugin extends Plugin {

    private TextRecognizer recognizer;

    @Override
    public void load() {
        recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS);
    }

    /** Takes {@code image}, a base64 JPEG or PNG, and resolves to {@code text}. */
    @PluginMethod
    public void recognize(PluginCall call) {
        String image = call.getString("image");
        if (image == null) {
            call.reject("Missing image");
            return;
        }
        Bitmap bitmap;
        try {
            byte[] bytes = Base64.decode(image, Base64.DEFAULT);
            bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
        } catch (IllegalArgumentException error) {
            call.reject("Invalid image", error);
            return;
        }
        if (bitmap == null) {
            call.reject("Invalid image");
            return;
        }
        recognizer
            .process(InputImage.fromBitmap(bitmap, 0))
            .addOnSuccessListener(result -> {
                JSObject response = new JSObject();
                response.put("text", result.getText());
                call.resolve(response);
            })
            .addOnFailureListener(error -> call.reject("Text recognition failed", error))
            .addOnCompleteListener(task -> bitmap.recycle());
    }

    @Override
    protected void handleOnDestroy() {
        recognizer.close();
    }
}
