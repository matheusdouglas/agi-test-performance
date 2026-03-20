#!/bin/sh
set -e

# Limpa artefatos anteriores para evitar erros do NonGUIDriver
rm -f /results/results.jtl 2>/dev/null || true
mkdir -p /reports
rm -rf /reports/* 2>/dev/null || true

exec jmeter -n -t /tests/test-plan.jmx -l /results/results.jtl -e -o /reports -f
