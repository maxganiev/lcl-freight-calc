<?php
echo 1234;
require_once realpath(__DIR__ . '/vendor/autoload.php');

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();


define('CURRCONV_KEY', $_ENV["CURRCONV_API_KEY"]);
define('GMAIL_KEY', $_ENV["GMAIL_AUTH_KEY"]);

//change to PRODUCTION prior deployment:
define('MODE', 'DEVELOPMENT');
