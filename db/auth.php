<?php
require('dbconn.php');
require('jwt.php');

define('AUTH_EMAIL', base64_decode(urldecode($_POST['auth_email'])));
define('AUTH_PASS', base64_decode(urldecode($_POST['auth_pass'])));

if (AUTH_EMAIL && AUTH_PASS) {
  //creating a query to get a specific user from db:
  $query = "SELECT * FROM userdata WHERE EMAIL = '" . mysqli_real_escape_string($connection, AUTH_EMAIL) . "'" . "AND PASSWORD = '" . mysqli_real_escape_string($connection, AUTH_PASS) . "'";

  //get result of quering:
  $res = mysqli_query($connection, $query);
  $data = mysqli_fetch_all($res, MYSQLI_ASSOC);

  $userExists =  count($data);

  if ($userExists !== 0) {
    $headers = ['alg' => 'HS256', 'typ' => 'JWT'];
    $payload = ['email' => $_POST['auth_email'], 'loggedin' => time() * 1000];

    $jwt = generate_jwt($headers, $payload);

    $token_query =  "UPDATE userdata SET TOKEN = '$jwt' WHERE EMAIL = '" . mysqli_real_escape_string($connection, AUTH_EMAIL) . "'" . "AND PASSWORD = '" . mysqli_real_escape_string($connection, AUTH_PASS) . "'";

    mysqli_query($connection, $token_query);

    $jsonRes = ['token' => $jwt, 'loggedin' => time() * 1000];
    echo json_encode($jsonRes);
  } else {
    header("HTTP/1.1 403 Access denied");
    exit(json_encode('User doesn\'t exist'));
  }

  //free res:
  mysqli_free_result($res);
  //closing connection:
  mysqli_close($connection);
} else {
  define('AUTH_TOKEN', $_POST['auth_token']);

  if (AUTH_TOKEN) {
    $query = "SELECT * FROM userdata WHERE TOKEN = '" . mysqli_real_escape_string($connection, AUTH_TOKEN) . "'";
    $res = mysqli_query($connection, $query);
    $data = mysqli_fetch_all($res, MYSQLI_ASSOC);

    $userIsAuthorized =  count($data);

    if ($userIsAuthorized !== 0) {
      echo 'OK';
    } else {
      header("HTTP/1.1 403 Access denied");
      exit(json_encode('Token got expired'));
    }

    //free res:
    mysqli_free_result($res);
    //closing connection:
    mysqli_close($connection);
  }
}
