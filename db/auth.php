<?php
require('dbconn.php');

//creating a query to get data from certain table in db:
$query = 'SELECT * FROM `userdata`';

//get result of quering:
$res = mysqli_query($connection, $query);
$data = mysqli_fetch_all($res, MYSQLI_ASSOC);


define('AUTH_EMAIL', base64_decode(urldecode($_POST['auth_email'])));
define('AUTH_PASS', base64_decode(urldecode($_POST['auth_pass'])));

$userExists = false;

if (AUTH_EMAIL && AUTH_PASS) {
  foreach ($data as $key => $arr) {
    $userExists =  (in_array(AUTH_EMAIL, array_column($data, 'EMAIL')) && in_array(AUTH_PASS, array_column($data, 'PASSWORD'))) ?  true : false;
  }

  authUser($userExists);
}


function authUser($isUser)
{
  if ($isUser) {
    echo json_encode('User is authenticated');
  } else {
    header("HTTP/1.1 403 Access denied");
    exit(json_encode('User doesn\'t exist'));
  }
};


//free res:
mysqli_free_result($res);

//closing connection:
mysqli_close($connection);
