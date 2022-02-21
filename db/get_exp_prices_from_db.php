<?php


if (isset($_POST['delMode'])) {
  define('DEPCOUNTRY', $_POST['depCountry']);

  switch (DEPCOUNTRY) {
    case 'CN, South_Center':
      referDb('exp_rail_cn_north');
      break;

    case 'Kor':
      referDb('exp_air_kor');
      break;
  }
} else {
  json_encode('Пустой запрос.');
}

function referDb($dbName)
{
  require('dbconn.php');
  define('TABLE_NAME',  'delivery_pricelist_' . $dbName);

  //creating a query to get data from certain table in db:
  $query = "SELECT * FROM " . TABLE_NAME;

  //get result of quering:
  $res = mysqli_query($connection, $query);
  $data = mysqli_fetch_all($res, MYSQLI_ASSOC);

  echo json_encode($data);

  //free res:
  mysqli_free_result($res);

  //closing connection:
  mysqli_close($connection);
}