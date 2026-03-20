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

## Principais Métricas por Ação

- GET / (Home): erro 0,28%, média ~701 ms
- POST /reserve.php (Paris → Berlin): erro 0,34%, média ~721 ms
- GET /purchase.php?flight=…: erro 0,33%, média ~718 ms
- POST /purchase.php (Confirmar compra): erro 100% (asserção)
- Grupo Spike (1 min): ações equivalentes com 0% erro nas amostras observadas

## Erros Mais Frequentes

- Test failed: text expected to contain “Thank you for your purchase today!”: 98,76% dos erros
- 429 Too Many Requests: 1,24% dos erros

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

## Ações Sugeridas

- Ajustar/relaxar a asserção de sucesso para tolerar variações de conteúdo (ex.: procurar por “Thank you” ou validar presença de ID de compra).
- Validar parâmetros do POST de compra e dependência de cookies/sessão (Cookie Manager já adicionado).
- Executar cenários separadamente (Carga e Pico) e gerar relatórios independentes para isolar métricas.
- Considerar redução progressiva de threads no arranque inicial para evitar burst que induza 429, mantendo o Throughput Timer em 250 RPS.
- Reexecutar em janelas de menor variação de rede ou com recursos de máquina mais altos.

## Como Anexar

- Compactar `reports/` → `reports-blazedemo.zip`.
- Anexar `results/results.jtl` e, se desejado, `docker compose logs jmeter` como evidência de execução.

## Reproduzir Rápido (Smoke)

- Reduzir `ThreadGroup.duration` para ~60–120s, manter o Throughput Timer e executar pelo Docker/CLI para gerar um relatório rápido e validar ajustes.
