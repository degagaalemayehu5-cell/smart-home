#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
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
const char* serverName = "http://10.209.29.2:5000/api/sensors";

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
  
  Serial.println("\n✅ Connected!");
  digitalWrite(GREEN_LED, HIGH); // Solid Green once connected
}

void loop() {
  // --- 1. REAL-TIME HARDWARE LOGIC (Zero Lag) ---
  float currentTemp = dht.readTemperature();
  bool motionDetected = digitalRead(PIR_PIN);

  // Critical Condition Check
  bool isCritical = (motionDetected == true || currentTemp > 35.0);

  if (isCritical) {
    // ALERT MODE: Red ON, Green OFF immediately
    digitalWrite(GREEN_LED, LOW); 
    digitalWrite(RED_LED, HIGH); 
  } else {
    // SECURE MODE: Red OFF, Green ON (if WiFi is okay)
    digitalWrite(RED_LED, LOW);
    if (WiFi.status() == WL_CONNECTED) {
      digitalWrite(GREEN_LED, HIGH);
    } else {
      digitalWrite(GREEN_LED, LOW); // Green off if WiFi lost
    }
  }

  // --- 2. ASYNC WEB UPDATE (Every 5 Seconds) ---
  // This part runs without stopping the LED logic above
  unsigned long currentMillis = millis();
  
  if (currentMillis - lastUploadTime >= uploadInterval) {
    if (WiFi.status() == WL_CONNECTED) {
      WiFiClient client;
      HTTPClient http;
      
      float h = dht.readHumidity();
      int l = analogRead(LDR_PIN);

      String payload = "{\"temp\":" + String(currentTemp) + 
                       ",\"hum\":" + String(h) + 
                       ",\"lux\":" + String(l) + 
                       ",\"motion\":" + (motionDetected ? "true" : "false") + "}";

      http.begin(client, serverName);
      http.addHeader("Content-Type", "application/json");
      
      // We don't use delay here, so the loop keeps spinning
      int httpCode = http.POST(payload);
      Serial.printf("[HTTP] POST... code: %d\n", httpCode);
      
      http.end();
    }
    lastUploadTime = currentMillis; // Reset the 5-second timer
  }
}