import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

/**
 * Chunk próprio: o Recharts custa ~100kB gzip e só é necessário quando
 * a seção de ferramentas entra em cena.
 *
 * Os dados vêm da API do GitHub — quantos repositórios têm cada linguagem
 * como principal. É contagem, não estimativa.
 */
export default function LanguageChart({
  data,
}: {
  data: { language: string; count: number }[]
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 28, bottom: 4, left: 4 }}
      >
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="language"
          axisLine={false}
          tickLine={false}
          width={92}
          tick={{
            fill: 'var(--fg-dim)',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
          }}
        />
        <Bar dataKey="count" barSize={14} isAnimationActive>
          {data.map((entry, index) => (
            <Cell
              key={entry.language}
              // Primeira em ciano, segunda em âmbar, o resto em linha neutra.
              // Duas tintas bastam para separar o pódio do resto sem virar
              // um gráfico de arco-íris, onde a cor deixa de significar algo.
              fill={
                index === 0
                  ? 'var(--accent)'
                  : index === 1
                    ? 'var(--accent-2)'
                    : 'var(--rule)'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
