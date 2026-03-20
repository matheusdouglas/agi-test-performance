# Relatório de Execução — BlazeDemo (JMeter)

## Contexto

- Cenário: compra de passagem aérea no https://blazedemo.com com sucesso.
- Ferramenta: Apache JMeter 5.6.3 (Docker/CLI/GUI).
- Perfis executados no mesmo plano:
  - Carga: 250 RPS, ramp-up 60s, duração 9 min.
  - Pico (Spike): 250 RPS, ramp-up 5s, duração 60s.

## Ambiente e Reprodutibilidade

- Docker: `docker compose -f docker/docker-compose.yml up --build`
- CLI: `jmeter -n -t jmeter/test-plan.jmx -l results/results.jtl -e -o reports`
- Evidências:
  - HTML Dashboard: `reports/index.html`
  - Log bruto: `results/results.jtl`

## KPIs Consolidados (do Dashboard)

- Amostras totais: 112.595
- Erro (%): 21,91%
- Média: 749,7 ms
- Mediana: 433,0 ms
- p90: 4.641,1 ms
- p95: 7.935,8 ms
- p99: 10.109,0 ms
- Throughput total: 204,60 req/s

<img width="1914" height="981" alt="image" src="https://github.com/user-attachments/assets/b2a47b62-cd9d-4ec6-b53e-c782cf86736e" />


## Principais Métricas por Ação

- GET / (Home): erro 0,28%, média ~701 ms
- POST /reserve.php (Paris → Berlin): erro 0,34%, média ~721 ms
- GET /purchase.php?flight=…: erro 0,33%, média ~718 ms
- POST /purchase.php (Confirmar compra): erro 100% (asserção)
- Grupo Spike (1 min): ações equivalentes com 0% erro nas amostras observadas

<img width="1622" height="676" alt="image" src="https://github.com/user-attachments/assets/fc295b0b-9728-4438-90ab-9b68954e7ec7" />


## Erros Mais Frequentes

- Test failed: text expected to contain “Thank you for your purchase today!”: 98,76% dos erros
- 429 Too Many Requests: 1,24% dos erros

<img width="1672" height="305" alt="image" src="https://github.com/user-attachments/assets/ec9d4ac6-8fb8-40d4-a7d7-2717ab7ed668" />


Interpretação:

- A maior parte dos erros vem da asserção de sucesso da compra. Isso indica que o POST de confirmação retornou uma página sem a frase esperada (pode ser formulário de compra novamente, variação de conteúdo, ou bloqueio/limitação do site).
- Ocorrências de 429 mostram limitação/controle de taxa no BlazeDemo sob carga alta, afetando latências e sucesso.

## Critério de Aceitação

- Vazão alvo: 250 req/s
  - Observado (total): 204,60 req/s (média agregada). Em janelas de 30s observou-se ~239–241 req/s durante ramp-up; valores finais podem oscilar pela política do site e limitações de rede/CPU.
- Qualidade: p90 < 2.000 ms
  - Observado: p90 = 4.641 ms (não atendido).

Conclusão: critério não atendido na execução atual (p90 > 2s e throughput agregado < 250/s), principalmente devido a:

- Falha de asserção na etapa de confirmação de compra no fluxo de carga.
- Respostas 429 (Rate Limiting) durante alta vazão.

