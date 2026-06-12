package org.mandirtrust.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        try {
            // Check if FirebaseApp is available in classpath
            Class<?> firebaseAppClass = Class.forName("com.google.firebase.FirebaseApp");
            
            // Check if already initialized by trying to call FirebaseApp.getInstance()
            java.lang.reflect.Method getInstanceMethod = firebaseAppClass.getMethod("getInstance");
            try {
                getInstanceMethod.invoke(null);
            } catch (java.lang.reflect.InvocationTargetException ite) {
                // If it threw an exception, check if the cause is IllegalStateException
                if (ite.getCause() instanceof IllegalStateException) {
                    // Firebase is not initialized. Initialize with dummy options to prevent crashes.
                    Class<?> firebaseOptionsClass = Class.forName("com.google.firebase.FirebaseOptions");
                    Class<?> builderClass = Class.forName("com.google.firebase.FirebaseOptions$Builder");
                    
                    Object builder = builderClass.getDeclaredConstructor().newInstance();
                    
                    builderClass.getMethod("setApplicationId", String.class).invoke(builder, "1:1234567890:android:1234567890");
                    builderClass.getMethod("setApiKey", String.class).invoke(builder, "dummy_api_key");
                    builderClass.getMethod("setProjectId", String.class).invoke(builder, "dummy-project");
                    
                    Object options = builderClass.getMethod("build").invoke(builder);
                    
                    firebaseAppClass.getMethod("initializeApp", android.content.Context.class, firebaseOptionsClass)
                        .invoke(null, this, options);
                }
            }
        } catch (Exception e) {
            // Firebase class not found or reflection error, skip initialization
            e.printStackTrace();
        }
    }
}
