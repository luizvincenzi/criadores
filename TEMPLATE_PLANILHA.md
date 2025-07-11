# 📊 TEMPLATE DA PLANILHA GOOGLE SHEETS

## 🎯 **PLANILHA ID:** `14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI`

**URL:** https://docs.google.com/spreadsheets/d/14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI/edit

---

## 📋 **ABA "Businesses" - ESTRUTURA PRINCIPAL**

### **🗂️ CABEÇALHOS (Linha 1):**
```
A1: id
B1: businessName
C1: journeyStage
D1: nextAction
E1: contactDate
F1: value
G1: description
H1: creators
I1: campaigns
```

### **📝 DADOS DE EXEMPLO (Linhas 2-6):**

#### **Linha 2:**
```
A2: 1
B2: Loja de Roupas Fashion
C2: Agendamentos
D2: Agendar sessões de fotos com criadores
E2: 2024-01-15
F2: 15000
G2: Campanha de verão focada em roupas casuais para jovens de 18-30 anos
H2: [{"name":"Ana Silva","username":"anasilva","followers":125000,"engagementRate":4.2},{"name":"Carlos Santos","username":"carlossantos","followers":89000,"engagementRate":6.8}]
I2: [{"title":"Campanha Verão 2024","status":"Ativa","startDate":"2024-01-15","endDate":"2024-03-15"}]
```

#### **Linha 3:**
```
A3: 2
B3: Restaurante Gourmet
C3: Reunião Briefing
D3: Definir estratégia de conteúdo gastronômico
E3: 2024-01-10
F3: 8000
G3: Divulgação de pratos especiais e experiência gastronômica única
H3: [{"name":"Maria Oliveira","username":"mariaoliveira","followers":234000,"engagementRate":3.1}]
I3: []
```

#### **Linha 4:**
```
A4: 3
B4: Academia Fitness Plus
C4: Entrega Final
D4: Finalizar edição dos vídeos de treino
E4: 2024-01-20
F4: 25000
G4: Campanha de motivação fitness com foco em resultados reais
H4: [{"name":"João Fitness","username":"joaofitness","followers":156000,"engagementRate":5.4},{"name":"Carla Strong","username":"carlastrong","followers":98000,"engagementRate":7.2},{"name":"Pedro Muscle","username":"pedromuscle","followers":67000,"engagementRate":4.8}]
I4: [{"title":"Transformação 90 Dias","status":"Ativa","startDate":"2024-01-01","endDate":"2024-03-31"}]
```

#### **Linha 5:**
```
A5: 4
B5: Clínica de Estética
C5: Reunião Briefing
D5: Alinhar diretrizes de comunicação sobre procedimentos
E5: 2024-01-12
F5: 12000
G5: Divulgação de tratamentos estéticos com foco em naturalidade
H5: [{"name":"Bella Beauty","username":"bellabeauty","followers":189000,"engagementRate":6.1}]
I5: []
```

#### **Linha 6:**
```
A6: 5
B6: Loja de Eletrônicos
C6: Agendamentos
D6: Coordenar reviews de produtos com tech criadores
E6: 2024-01-08
F6: 18000
G6: Reviews autênticos de gadgets e eletrônicos inovadores
H6: [{"name":"Tech Master","username":"techmaster","followers":145000,"engagementRate":5.9},{"name":"Gamer Pro","username":"gamerpro","followers":203000,"engagementRate":4.5}]
I6: [{"title":"Tech Reviews 2024","status":"Planejamento","startDate":"2024-02-01","endDate":"2024-04-30"}]
```

---

## 📋 **VALORES PERMITIDOS:**

### **🛤️ journeyStage (Coluna C):**
- `Reunião Briefing`
- `Agendamentos`
- `Entrega Final`

### **📊 Formato JSON para creators (Coluna H):**
```json
[
  {
    "name": "Nome do Criador",
    "username": "username_sem_@",
    "followers": 125000,
    "engagementRate": 4.2,
    "email": "criador@email.com"
  }
]
```

### **📢 Formato JSON para campaigns (Coluna I):**
```json
[
  {
    "title": "Nome da Campanha",
    "status": "Ativa",
    "startDate": "2024-01-15",
    "endDate": "2024-03-15",
    "brief": "Descrição da campanha"
  }
]
```

### **💰 Formato value (Coluna F):**
- Apenas números (sem R$, pontos ou vírgulas)
- Exemplo: `15000` para R$ 15.000

### **📅 Formato contactDate (Coluna E):**
- Formato: `YYYY-MM-DD`
- Exemplo: `2024-01-15`

---

## 🔄 **COMO COPIAR PARA SUA PLANILHA:**

### **1️⃣ ABRIR SUA PLANILHA:**
https://docs.google.com/spreadsheets/d/14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI/edit

### **2️⃣ CRIAR ABA "Businesses":**
1. **Clique no "+"** no canto inferior esquerdo
2. **Renomeie** para "Businesses"

### **3️⃣ ADICIONAR CABEÇALHOS:**
1. **Selecione a célula A1**
2. **Digite:** `id`
3. **Continue** preenchendo B1 até I1 com os cabeçalhos

### **4️⃣ ADICIONAR DADOS DE EXEMPLO:**
1. **Copie e cole** cada linha de exemplo
2. **Ajuste** conforme seus negócios reais

### **5️⃣ FORMATAR COLUNAS:**
- **Coluna A (id):** Formato número
- **Coluna E (contactDate):** Formato data
- **Coluna F (value):** Formato número
- **Colunas H e I:** Formato texto (para JSON)

---

## 🎯 **DICAS IMPORTANTES:**

### **✅ BOAS PRÁTICAS:**
- **IDs únicos:** Sempre use números sequenciais únicos
- **JSON válido:** Use aspas duplas nos JSONs
- **Datas consistentes:** Sempre formato YYYY-MM-DD
- **Valores numéricos:** Sem formatação, apenas números

### **⚠️ CUIDADOS:**
- **Não altere** os nomes das colunas (cabeçalhos)
- **Não deixe** células vazias nas colunas obrigatórias
- **Teste** sempre após adicionar novos dados

### **🔧 VALIDAÇÃO:**
Após configurar, teste:
1. **Arraste** um negócio no Kanban
2. **Verifique** se a planilha foi atualizada
3. **Confirme** se o evento foi criado no calendário

---

## 🚀 **RESULTADO ESPERADO:**

Com a planilha configurada corretamente:
- ✅ **Dados reais** aparecerão no CRM
- ✅ **Drag & drop** atualizará a planilha
- ✅ **Agendamentos** serão criados automaticamente
- ✅ **Todas as páginas** mostrarão dados integrados

**🎯 SUA PLANILHA ESTARÁ PRONTA PARA USO! 🎯**
