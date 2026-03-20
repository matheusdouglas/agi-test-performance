# Blazedemo Performance (JMeter)

## Objetivo

- Sustentar ~250 requisições/segundo por 9 minutos.
- 95º percentil de resposta abaixo de 2s.
- Fluxo de compra completo no BlazeDemo.
- Execução via Docker e CI GitHub Actions com relatório HTML.

## Estrutura

- jmeter/test-plan.jmx — Plano JMeter headless (compra completa)
- jmeter/users.csv — Dados parametrizados simples
- docker/Dockerfile — Imagem com JMeter
- docker/docker-compose.yml — Execução e servidor de relatórios (Nginx)
- .github/workflows/jmeter.yml — Pipeline CI
- results/ — Saída JTL (gerada)

## Como Executar (Local)

### 1) Docker Compose (recomendado)

```bash
cd blazedemo-jmeter
docker compose -f docker/docker-compose.yml up --build
```

- O teste roda ~9 minutos e gera:
  - Arquivo JTL em ./results/results.jtl
  - Relatório HTML em ./reports/

### 2) JMeter Desktop (GUI)

1. Abra o Apache JMeter (jmeter GUI).
2. Arquivo → abri → selecione jmeter/test-plan.jmx. (Que esta neste diretorio)
3. Confirme em “CSV Users” que o arquivo aponta para users.csv (relativo ao .jmx).
4. Clique em “Start”. Acompanhe “Summary Report” e “Aggregate Report”.
5. Para gerar o HTML Dashboard pela GUI, use “Tools → Generate Dashboard” após a execução, ou rode via CLI conforme seção “JMeter CLI”.
6. Dica: Para smoke test rápido, reduza a duração do Scheduler e/ou o número de threads no Thread Group.

## 📈 Metas e Observabilidade

- Constant Throughput Timer configurado para ~250 RPS (15000/min).
- Duração: 9 minutos (Thread Group com scheduler).
- Relatórios HTML nativos do JMeter (Aggregate e Summary inclusos).
- Valide p(90) < 2000ms no relatório (Statistics/Percentiles).

### Cenários incluídos

- Carga: 250 RPS por 9 minutos (ramp-up 60s).
- Pico: 250 RPS com ramp-up de 5s por 60s (spike).

## 🔁 Fluxo de Teste (Plano)

1. GET / (Home)
2. POST /reserve.php (fromPort=Paris, toPort=Berlin)
3. Extrai ID do voo (regex em formulário de voo)
4. GET /purchase.php?flight=${flight}
5. POST /purchase.php com dados do formulário
6. Asserção: “Thank you for your purchase today!”

Observação: O endpoint de confirmação no BlazeDemo válido é o POST em /purchase.php.

## 🧪 CI (GitHub Actions)

- Em cada push/manual, o workflow executa o plano e publica o artefato HTML em “jmeter-reports”.

## ⚙️ Requisitos

- Docker Desktop instalado para execução local.
- Acesso à internet para https://blazedemo.com.

## ❗Notas

- 250 RPS reais dependem de latência de rede e recursos; o timer mantém a taxa alvo.
- Ajuste threads / throughput conforme seu hardware e rede.
- Se usar Docker, garanta o Docker Desktop em execução antes de rodar.
