<?php
class ApiClient {
    private $baseUrl;

    public function __construct($url = 'http://localhost:3000/api') {
        $this->baseUrl = $url;
    }

    /**
     * Testa a conexão com a API Node.js (Checkpoint 3 e 4)
     */
    public function testarConexao() {
        $ch = curl_init();
        // Acessa a rota de teste criada no Express
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/teste');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        // Timeout pequeno para não travar o carregamento do PHP caso o Node esteja offline
        curl_setopt($ch, CURLOPT_TIMEOUT, 3); 

        $response = curl_exec($ch);
        curl_close($ch);

        if ($response) {
            return json_decode($response, true);
        }
        
        return false;
    }
}
?>
