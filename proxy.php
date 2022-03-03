<?php
require_once('config.php');

$callback = $_POST['callback'];

if (!function_exists($callback) || !$_POST['callback']) {
  echo json_encode('Undefined or incorrect function name was supplied by the client...');
} else {
  $callback();
};


function getCurrencyAPI()
{
  header('Content-Type: application/json');

  //dis(en-)abling errors and warnings depending on development mode:
  MODE === 'PRODUCTION' ? error_reporting(0) : error_reporting(E_ALL);

  $today = date('Y-m-d');
  $res = file_get_contents("https://free.currconv.com/api/v7/convert?q=USD_RUB,EUR_RUB&compact=ultra&date=$today&apiKey=" . CURRCONV_KEY);

  if ($http_response_header[0] !== 'HTTP/1.1 200 OK') {
    header("HTTP/1.1 500 currconv API is not responding atm");
    exit(returnJson("Error: Some problems have occured while fetching the data..."));
  } else {
    returnJson($res);
  };
};

function getGmailApi()
{
  header('Content-Type: application/json');

  $encoded = base64_encode(base64_encode(GMAIL_KEY));
  returnJson($encoded);
};

function returnJson($arg)
{
  echo json_encode($arg);
  return null;
};
