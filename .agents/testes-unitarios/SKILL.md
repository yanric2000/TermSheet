---
name: testes-unitarios
description: Convenções e padrões para criação e manutenção de testes unitários com Jest. Use ao criar, modificar ou revisar arquivos .spec.ts.
---

# Testes Unitários

Convenções obrigatórias para testes unitários neste projeto.

## Quando Usar

- Ao criar ou modificar arquivos `.spec.ts`.
- Ao criar uma nova funcionalidade (componente, service, facade, pipe, etc.) — criar o arquivo `.spec.ts` junto, mas deixá-lo vazio até que a funcionalidade esteja completa e o prompt peça explicitamente a codificação dos testes.

---

## 1. Regra de Criação

- Ao criar uma funcionalidade nova, **sempre** criar o arquivo `.spec.ts` correspondente.
- O arquivo de teste NÃO deve ser codificado a menos que o prompt peça explicitamente.
- Quando o prompt pedir testes, buscar pelo menos 90% de cobertura.

---

## 2. Nomenclatura

### 2.1 describe (um único por arquivo)

Formato: `'nome-do-arquivo.spec | NomeDaClasse'`

```typescript
describe('raias.facade.spec | RaiasFacade', () => {
  /**/
});
```

```typescript
describe('gerenciador-campos-cards-descricao-visivel.pipe.spec | GerenciadorCamposCardsDescricaoVisivelPipe', () => {
  /**/
});
```

- NUNCA criar mais de um bloco `describe`. Exceções para componentes que ao serem instanciados já realizam alguma ação que não é possível testar de outra forma.

### 2.2 it — sempre iniciar com "deve"

```typescript
it('deve retornar itens de índice par para coluna esquerda', () => {
  /**/
});
```

---

## 3. Estrutura Given / When / Then

Todo bloco `it` deve usar comentários para separar as etapas(Given, When, Then):

```typescript
it('deve calcular o total', () => {
  // Given
  const entrada = [1, 2, 3];
  // When
  const resultado = calcularTotal(entrada);
  // Then
  expect(resultado).toBe(6);
});
```

---

## 4. Mocks

### 4.1 Função utilitária: criarObjetoEspiaoJest

O projeto possui uma função tipada para criar mocks. SEMPRE usá-la ao invés de criar objetos com `any`:

- O primeiro parâmetro é um array com os nomes dos métodos a serem mockados.
- O segundo parâmetro (opcional) é um objeto parcial para propriedades não-método.
- Retorna um objeto tipado com `jest.fn()` para cada método listado.

### 4.2 Padrão Factory para mocks

Mocks devem ser criados como **funções factory** exportadas:

```typescript
// Mock de service (retorna apenas o spy)
export const meuServiceMockFactory = (): ObjetoEspiaoJest<MeuService> => {
  return criarObjetoEspiaoJest<MeuService>(['obterDados', 'salvarDados']);
};

// Provider factory (retorna { provide, useValue })
export const meuServiceProviderFactory = () => ({
  provide: MeuService,
  useValue: meuServiceMockFactory(),
});
```

### 4.3 Padrão Factory para dados

Mocks de dados também devem ser funções factory:

```typescript
export const quadrosGetAllFactory = (): IQuadroGetAll[] => [
  { ativo: true, descricao: 'Quadro 1', id: 'quadro-1' },
  { ativo: false, descricao: 'Quadro 2', id: 'quadro-2' },
];
```

### 4.4 Localização dos mocks

| Tipo de mock                              | Localização                          | Exportar via index.ts? |
| ----------------------------------------- | ------------------------------------ | ---------------------- |
| Mock de service / facade / helper / dados | `src/modules/<ctx>/mock-data/`       | SIM                    |
| Mock de componente                        | `src/modules/<ctx>/mock-components/` | SIM                    |

Antes de criar um mock, verificar se já existe um no diretório correspondente.

### 4.5 Mock de componente

```typescript
@Component({
  selector: 'meu-componente',
  template: '',
  standalone: true,
})
export class MeuComponenteMockComponent {
  meuMetodo: MeuComponente['meuMetodo'] = jest.fn(() => of(null));
}
```

- Arquivo com sufixo `.mock.ts`, classe com sufixo `MockComponent`.
- Selector idêntico ao componente original.
- Template vazio.

---

## 5. Setup do TestBed

- Não modificar de forma forçada propriedades ou métodos privados.

### 5.1 Componentes Angular (criação via TestBed)

Ao testar um **componente**, é obrigatório:

1. Criar o componente com `TestBed` (`configureTestingModule` + `createComponent`).
2. Declarar no escopo do `describe` uma variável para a **fixture** (`ComponentFixture<T>`) e outra para a **instância** do componente (`T`), preenchidas no `beforeEach`.
3. Usar `fixture` e `component` nos `it` em vez de repetir `TestBed.createComponent` dentro de cada teste.

Exemplo mínimo (padrão esperado):

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeuStandaloneComponent } from './meu-standalone.component';

describe('meu-standalone.component.spec | MeuStandaloneComponent', () => {
  let component: MeuStandaloneComponent;
  let fixture: ComponentFixture<MeuStandaloneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeuStandaloneComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MeuStandaloneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    // Given
    // When
    // Then
    expect(component).toBeTruthy();
  });
});
```

### 5.2 Com TestBed (providers, services com DI)

```typescript
describe('meu-componente.component | MeuComponenteComponent', () => {
  let meuServiceMock: ObjetoEspiaoJest<MeuService>;

  beforeEach(async () => {
    const meuServiceProvider = meuServiceProviderFactory();
    meuServiceMock = meuServiceProvider.useValue;

    await TestBed.configureTestingModule({
      providers: [meuServiceProvider],
    });
  });
});
```

### 5.3 Sobrescrevendo retorno de mock

Guardar a referência do mock no `beforeEach` e sobrescrever no `it`:

```typescript
let meuServiceMock: ObjetoEspiaoJest<MeuService>;

beforeEach(() => {
  const provider = meuServiceProviderFactory();
  meuServiceMock = provider.useValue;
  // ...
  TestBed.configureTestingModule({ providers: [provider] });
});
```

### 5.4 Realizar mock completo

- Mockar TODAS as dependências injetadas, utilizar mock de componente ou então o SCHEMA para evitar que o teste log erros como "propriedade X do componente Y não encontrada".

---

## 6. Execução

Rodar testes de arquivos específicos e/ou arquivos modificados que divergem da branch atual.
