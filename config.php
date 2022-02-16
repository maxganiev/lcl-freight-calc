<?php
echo 1;
require_once('vendor/autoload.php');
echo 2;

use Dotenv\Dotenv;
echo 3;
$dotenv = Dotenv::createImmutable(__DIR__);
echo 4;
$dotenv->load();
echo 5;


define('CURRCONV_KEY', $_ENV["CURRCONV_API_KEY"]);
define('GMAIL_KEY', $_ENV["GMAIL_AUTH_KEY"]);

//change to PRODUCTION prior deployment:
define('MODE', 'DEVELOPMENT');
