<?php 
header("Access-Control-Allow-Origin: *");

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "https://la1.api.riotgames.com/lol/summoner/v4/summoners/by-name/pantoja2?api_key=RGAPI-e5f6010f-404b-438b-8f68-76f034dfa4a6",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "GET",
  CURLOPT_POSTFIELDS => "",
  CURLOPT_HTTPHEADER => array(
    "Postman-Token: f57785c4-7fe6-49ac-b6bd-ec70fdb1d27b",
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