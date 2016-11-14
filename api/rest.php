<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use Firebase\JWT\JWT;

require 'vendor/autoload.php';
require 'db.php';

$app = new \Slim\App;
DB::init('mysql:dbname=information_schema;host=127.0.0.1;port=3306', 'root', '');

define('AUTH_SECRET', "supersecretkeyyoushouldnotcommittogithub");

$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

$app->add(function ($req, $res, $next) {
    $response = $next($req, $res);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
});

/* auth */
//$app->add(new \Slim\Middleware\JwtAuthentication([
//    "secret" => "supersecretkeyyoushouldnotcommittogithub"
//]));


$app->add(new \Slim\Middleware\JwtAuthentication([
//    "logger" => $logger,
    "secret" => AUTH_SECRET,
    "rules" => [
        new \Slim\Middleware\JwtAuthentication\RequestPathRule([
//            "path" => "/api",
            "passthrough" => ["/token"]
        ]),
        new \Slim\Middleware\JwtAuthentication\RequestMethodRule([
            "passthrough" => ["OPTIONS"]
        ])
    ]
]));

//$app->add(new \Slim\Middleware\HttpBasicAuthentication([
//    "path" => "/api/token",
//    "users" => [
//        "user" => "password"
//    ]s
//]));

$app->post("/token", function (Request $request, Response $response) {
    /* Here generate and return JWT to the client. */
//    exit('O_o');
    $data = $request->getParsedBody();

    $expireTime = 60 * 60;//in seconds

    $login = isset($data['login']) ? $data['login'] : '';
    $password = isset($data['password']) ? $data['password'] : '';
    if ($login == '1' && $password == '1') {
        $token = JWT::encode([
            "iss" => 1,
            'exp' => time() + $expireTime,
            'nbf' => time()
        ],
            AUTH_SECRET
        );
        $response->getBody()->write(json_encode([
            'id' => 1,
            'login' => $login,
            'token' => $token
        ]));
    } else {
        $response = $response->withStatus(400);
        $response->getBody()->write(json_encode([
            'error' => 'Invalid login'
        ]));
    }

    return $response;

});

$app->get('/posts', function (Request $request, Response $response) {
    $response->getBody()->write(json_encode([
        'data' => [
            [
                'id' => 1,
                'name' => 'foo'
            ],
            [
                'id' => 2,
                'name' => 'bar'
            ]
        ]
    ]));
    return $response;
});
$app->get('/test', function (Request $request, Response $response) {
    $response->getBody()->write(json_encode(DB::fetch('SELECT NOW()')));
    return $response;
});

$app->get('/posts/{id}', function (Request $request, Response $response) {
//    $name = $request->getAttribute('name');
    $response->getBody()->write("{}");

    return $response;
});

$app->run();