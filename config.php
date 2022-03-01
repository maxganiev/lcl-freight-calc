<?php
require_once('vendor/autoload.php');

//change to PRODUCTION prior deployment:
define('MODE', 'DEVELOPMENT');

use Dotenv\Dotenv;

if (MODE === 'DEVELOPMENT') {
  $dotenv = Dotenv::createImmutable(__DIR__);
  $dotenv->load();
} else {
  $dotenv = Dotenv::createImmutable(__DIR__ . '/../');
  $dotenv->safeLoad();
}


define('CURRCONV_KEY', $_ENV["CURRCONV_API_KEY"]);
define('GMAIL_KEY', $_ENV["GMAIL_AUTH_KEY"]);
