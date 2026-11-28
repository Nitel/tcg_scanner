package io.github.nitel.tcgscanner;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(CardOcrPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
