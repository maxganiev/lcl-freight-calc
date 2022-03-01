<?php

//encode jwt
function generate_jwt($headers, $payload, $secret = 'secret')
{
  $headers_encoded = base64url_encode(json_encode($headers));

  $payload_encoded = base64url_encode(json_encode($payload));

  $signature = hash_hmac('SHA256', "$headers_encoded.$payload_encoded", $secret, true);
  $signature_encoded = base64url_encode($signature);

  $jwt = "$headers_encoded.$payload_encoded.$signature_encoded";

  return $jwt;
}

function base64url_encode($str)
{
  return rtrim(strtr(base64_encode($str), '+/', '-_'), '=');
}

//decode jwt
function base64url_decode($jwt)
{
  $decoded_raw = json_decode(base64_decode(str_replace('_', '/', str_replace('-', '+', explode('.', $jwt)[1]))));

  $values = [];
  foreach ($decoded_raw as $data) {
    $values[] = $data;
  }

  $decoded_jwt = base64_decode(array_slice($values, 0, 1)[0]);
  return $decoded_jwt;
}
