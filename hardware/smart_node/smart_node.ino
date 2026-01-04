#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>

const char* ssid = "YOUR_HOTSPOT_NAME";
const char* password = "YOUR_HOTSPOT_PASSWORD";

// Use your NEW Render URL here
const char* serverName = "https://your-app-name.onrender.com/api/sensors";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWiFi Connected");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure(); // Trust the Render SSL certificate
    
    HTTPClient http;
    http.begin(client, serverName);
    http.addHeader("Content-Type", "application/json");

    // Replace with your real sensor data string
    String httpRequestData = "{\"temperature\":25, \"humidity\":60, \"motion\":false}"; 

    int httpResponseCode = http.POST(httpRequestData);
    Serial.println("HTTP Response code: " + String(httpResponseCode));
    http.end();
  }
  delay(10000); // Send data every 10 seconds
}