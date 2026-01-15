#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h> // Changed to Secure for HTTPS
#include "DHT.h"

#define DHTPIN D4
#define DHTTYPE DHT11
#define PIR_PIN D1
#define LDR_PIN A0
#define GREEN_LED D5
#define RED_LED D6

DHT dht(DHTPIN, DHTTYPE);

const char* ssid = "Galaxy M16 5G 5212";
const char* password = "dagi2468024";

// UPDATED: Your new Render Cloud URL
const char* serverName = "https://smart-home-1-zrth.onrender.com/api/sensors";

// Timer variable for non-blocking web updates
unsigned long lastUploadTime = 0;
const unsigned long uploadInterval = 5000; // 5 seconds

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  pinMode(PIR_PIN, INPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);

  // Initial State: Both off
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(RED_LED, LOW);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to Galaxy M16");
  
  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(RED_LED, HIGH); // Blink Red fast while connecting
    delay(100);
    digitalWrite(RED_LED, LOW);
    delay(100);
    Serial.print(".");
  }
  
  Serial.println("\n✅ Connected to WiFi!");
  digitalWrite(GREEN_LED, HIGH); // Solid Green once connected
}

void loop() {
  // --- 1. REAL-TIME HARDWARE LOGIC (Zero Lag) ---
  float currentTemp = dht.readTemperature();
  bool motionDetected = digitalRead(PIR_PIN);

  // Check for NaN (failed sensor read)
  if (isnan(currentTemp)) {
    currentTemp = 0.0; 
  }

  // Critical Condition Check
  bool isCritical = (motionDetected == true || currentTemp > 35.0);

  if (isCritical) {
    digitalWrite(GREEN_LED, LOW); 
    digitalWrite(RED_LED, HIGH); 
  } else {
    digitalWrite(RED_LED, LOW);
    if (WiFi.status() == WL_CONNECTED) {
      digitalWrite(GREEN_LED, HIGH);
    } else {
      digitalWrite(GREEN_LED, LOW);
    }
  }

  // --- 2. ASYNC WEB UPDATE (Every 5 Seconds) ---
  unsigned long currentMillis = millis();
  
  if (currentMillis - lastUploadTime >= uploadInterval) {
    if (WiFi.status() == WL_CONNECTED) {
      
      // Setup Secure Client for HTTPS
      WiFiClientSecure client;
      client.setInsecure(); // This allows the ESP8266 to connect to Render without needing a manual SSL Fingerprint
      
      HTTPClient http;
      
      float h = dht.readHumidity();
      int l = analogRead(LDR_PIN);

      // JSON Payload
      String payload = "{\"temp\":" + String(currentTemp) + 
                       ",\"hum\":" + String(h) + 
                       ",\"lux\":" + String(l) + 
                       ",\"motion\":" + (motionDetected ? "true" : "false") + "}";

      Serial.println("\n--- Sending Data to Cloud ---");
      http.begin(client, serverName);
      http.addHeader("Content-Type", "application/json");
      
      int httpCode = http.POST(payload);
      
      if (httpCode > 0) {
        Serial.printf("[HTTP] POST Success, code: %d\n", httpCode);
        if (httpCode == 201) {
          Serial.println("✅ Data saved to MongoDB!");
        }
      } else {
        Serial.printf("[HTTP] POST failed, error: %s\n", http.errorToString(httpCode).c_str());
      }
      
      http.end();
    }
    lastUploadTime = currentMillis; 
  }
}