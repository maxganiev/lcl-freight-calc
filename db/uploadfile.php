<?php
require('dbconn.php');

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
      $printMsg[] = 'Table successfully updated';
    } else {
      $printMsg[] = 'A problem has occured while updating the table';
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
    $printMsg[] = 'Upload failed';
  } else {
    $printMsg[] = 'Upload was successful';
    $printMsg[] = 'File has been successfully uploaded to db';
  }
} else {
  $printMsg[] = 'Append the file!';
}


$encoded = '';
foreach ($printMsg as $msg) {
  $encoded = $encoded  .  $msg . '. ';
}

echo json_encode($encoded);


//free res:
mysqli_free_result($res);

//closing connection:
mysqli_close($connection);
