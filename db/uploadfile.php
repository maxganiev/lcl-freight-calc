<?php
require('dbconn.php');
require('jwt.php');

define('TABLE_NAME',  'delivery_pricelist_' . $_FILES['fileupload']['name']);

//creating a query to get data from certain table in db:
$query = "SELECT * FROM " . TABLE_NAME;

//get result of quering:
$res = mysqli_query($connection, $query);
$data = mysqli_fetch_all($res, MYSQLI_ASSOC);


$printMsg = [];

if ($_FILES['fileupload']['name'] !== '') {
  if (count($data) !== 0) {
    $removal =  'DELETE FROM ' . TABLE_NAME;

    if (mysqli_query($connection, $removal)) {
      $printMsg[] = 'Таблица успешно обновлена';
    } else {
      $printMsg[] = 'Возникла проблема при обновлении таблицы';
    }
  }

  $file = $_FILES['fileupload']['tmp_name'];
  $file_open = fopen($file, 'r');

  // export pricelists:
  if (strpos(TABLE_NAME, 'exp_rail')) {
    while (($csv = fgetcsv($file_open, 1000, ';')) !== false) {
      $cbm = $csv[0];
      $freight = $csv[1];
      $export_charges = $csv[2];
      $pickup = $csv[3];
      $expd = $csv[4];

      $table_name = TABLE_NAME;
      $qr = mysqli_query($connection, "INSERT INTO $table_name VALUES ('$cbm','$freight', '$export_charges', '$pickup', '$expd')");
    }
  }

  if (strpos(TABLE_NAME, 'exp_air')) {
    while (($csv = fgetcsv($file_open, 1000, ';')) !== false) {
      $kgs = $csv[0];
      $freight_to_msc = $csv[1];
      $freight_to_petersburg = $csv[2];
      $export_charges = $csv[3];
      $pickup = $csv[4];
      $expd = $csv[5];

      $table_name = TABLE_NAME;
      $qr = mysqli_query($connection, "INSERT INTO $table_name VALUES ('$kgs','$freight_to_msc', '$freight_to_petersburg', '$export_charges', '$pickup', '$expd')");
    }
  }

  // import pricelists:
  if (strpos(TABLE_NAME, 'imp_rail')) {
    while (($csv = fgetcsv($file_open, 1000, ';')) !== false) {
      $cbm = $csv[0];
      $port_name = $csv[1];
      $handling_per_kg = $csv[2];
      $loading_per_kg = $csv[3];
      $todoor_delivery = $csv[4];

      $table_name = TABLE_NAME;
      $qr = mysqli_query($connection, "INSERT INTO $table_name VALUES ('$cbm','$port_name', '$handling_per_kg', '$loading_per_kg', '$todoor_delivery')");
    }
  }

  if (strpos(TABLE_NAME, 'imp_air')) {
    while (($csv = fgetcsv($file_open, 1000, ';')) !== false) {
      $kgs = $csv[0];
      $port_name = $csv[1];
      $awb_rate = $csv[2];
      $consignee_notification = $csv[3];
      $handling_per_kg = $csv[4];
      $loading_per_kg = $csv[5];
      $todoor_delivery = $csv[6];

      $table_name = TABLE_NAME;
      $qr = mysqli_query($connection, "INSERT INTO $table_name VALUES ('$kgs','$port_name', '$awb_rate', '$consignee_notification', '$handling_per_kg', '$loading_per_kg', '$todoor_delivery')");
    }
  }


  if (!$qr) {
    header("HTTP/1.1 405 Not allowed");
    exit(json_encode('Проверьте заполнение таблицы!'));
  } else {
    $printMsg[] = 'Загрузка успешна';
    $printMsg[] = 'Файл добавлен';
  }

  regUser($connection);
}

$encoded = '';
foreach ($printMsg as $msg) {
  $encoded = $encoded  .  $msg . '. ';
}

echo json_encode($encoded);


//add user modified a table to the registry:
function regUser($conn)
{
  $table_name = 'update_reg';
  $req = "SELECT UPDATED_AT FROM " . $table_name;
  $res = mysqli_query($conn, $req);

  if ($res) {
    $data = mysqli_fetch_all($res, MYSQLI_ASSOC);

    $today = strtotime('today');
    $date_from_DB = count($data) > 0 ? strtotime(reset($data[0])) : $today;

    //$test = strtotime('2022-12-23 12:00:00');

    //num of days last since first reg note:
    $diff = ($today - $date_from_DB) / 60 / 60 / 24;


    //if more than 3 months passed since very first inquiry - old values are removed from the reg table
    if ($diff >= 90) {
      $removal =  'DELETE FROM ' . $table_name;

      if (!mysqli_query($conn, $removal)) {
        header("HTTP/1.1 500 Internal error");
        exit(0);
      }
    }
  }


  $user_token = base64url_decode($_POST['token']);
  $filename = $_FILES['fileupload']['name'];

  $qr = mysqli_query($conn, "INSERT INTO $table_name VALUES ('$filename', '$user_token', DEFAULT)");

  if (!$qr) {
    header("HTTP/1.1 500 Internal error");
    exit(0);
  }
}


//free res:
mysqli_free_result($res);

//closing connection:
mysqli_close($connection);
