<?php 
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");
header('Content-Type: application/json');

$curl = curl_init();

$url = $_GET['url'];
error_log($url);
error_log(urlencode($url));

$api_key = "RGAPI-b8def0be-b39e-482b-8fa7-43c7c11eb1ec";

curl_setopt_array($curl, array(
  CURLOPT_URL => "https://la1.api.riotgames.com".$url."?api_key=".$api_key,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "GET",
  CURLOPT_POSTFIELDS => "",
  CURLOPT_HTTPHEADER => array(
    // "Postman-Token: f57785c4-7fe6-49ac-b6bd-ec70fdb1d27b",
    "cache-control: no-cache"
  ),
));

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}