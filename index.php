<?php 

$request = new HttpRequest();
$request->setUrl('https://la1.api.riotgames.com/lol/summoner/v4/summoners/by-name/pantoja2');
$request->setMethod(HTTP_METH_GET);

$request->setQueryData(array(
  'api_key' => 'RGAPI-e5f6010f-404b-438b-8f68-76f034dfa4a6'
));

$request->setHeaders(array(
  'Postman-Token' => '81933563-170f-4c73-9163-7ff1a55b5ffd',
  'cache-control' => 'no-cache'
));

try {
  $response = $request->send();

  echo $response->getBody();
} catch (HttpException $ex) {
  echo $ex;
}