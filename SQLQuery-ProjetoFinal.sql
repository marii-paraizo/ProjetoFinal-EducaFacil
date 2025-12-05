-- Criar o banco de dados
CREATE DATABASE DBProjetoFinal;
GO

-- Usar o banco criado
USE DBProjetoFinal;
GO

-- Tabela de turmas
CREATE TABLE tbTurmas (
    IdTurma UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Nome NVARCHAR(50) NOT NULL,
    AnoLetivo INT NOT NULL,
    QuantidadeAlunos INT NOT NULL DEFAULT 0
);
GO

-- Tabela de alunos
CREATE TABLE tbAlunos (
    IdAluno UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Nome NVARCHAR(80) NOT NULL,
    Rm VARCHAR(5) NOT NULL,
    DataNascimento DATE NOT NULL,
    IdTurma UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT FK_Alunos_Turmas FOREIGN KEY (IdTurma) REFERENCES tbTurmas(IdTurma)
);
GO

-- Triggers para atualizar QuantidadeAlunos
CREATE TRIGGER trg_Aluno_Insert
ON tbAlunos
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE T
    SET T.QuantidadeAlunos = T.QuantidadeAlunos + I.Qtde
    FROM tbTurmas T
    INNER JOIN (
        SELECT IdTurma, COUNT(*) AS Qtde
        FROM inserted
        GROUP BY IdTurma
    ) I ON T.IdTurma = I.IdTurma;
END;
GO

CREATE TRIGGER trg_Aluno_Delete
ON tbAlunos
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE T
    SET T.QuantidadeAlunos = T.QuantidadeAlunos - D.Qtde
    FROM tbTurmas T
    INNER JOIN (
        SELECT IdTurma, COUNT(*) AS Qtde
        FROM deleted
        GROUP BY IdTurma
    ) D ON T.IdTurma = D.IdTurma;
END;
GO

-- Inserindo turmas
INSERT INTO tbTurmas (Nome, AnoLetivo)
VALUES ('9º ano', 2025), ('8º ano', 2025), ('7º ano', 2025);
GO

-- Declarando variáveis para turmas e alunos no mesmo batch
DECLARE 
    @IdTurma9 UNIQUEIDENTIFIER = (SELECT TOP 1 IdTurma FROM tbTurmas WHERE Nome = N'9º ano'),
    @IdTurma8 UNIQUEIDENTIFIER = (SELECT TOP 1 IdTurma FROM tbTurmas WHERE Nome = N'8º ano'),
    @IdTurma7 UNIQUEIDENTIFIER = (SELECT TOP 1 IdTurma FROM tbTurmas WHERE Nome = N'7º ano');

-- Inserindo alunos
INSERT INTO tbAlunos (Nome, Rm, DataNascimento, IdTurma)
VALUES
(N'Laura Menezes', '58774', '2007-10-08', @IdTurma8),
(N'Mauro Santana', '68844', '2009-10-16', @IdTurma7),
(N'Carlos Souza', '34567', '2001-12-30', @IdTurma9),
(N'Maria Oliveira', '23456', '1999-08-15', @IdTurma9);

-- Declarando variáveis para alunos no mesmo batch
DECLARE 
    @IdLaura UNIQUEIDENTIFIER = (SELECT IdAluno FROM tbAlunos WHERE Nome = 'Laura Menezes'),
    @IdMauro UNIQUEIDENTIFIER = (SELECT IdAluno FROM tbAlunos WHERE Nome = 'Mauro Santana'),
    @IdCarlos UNIQUEIDENTIFIER = (SELECT IdAluno FROM tbAlunos WHERE Nome = 'Carlos Souza'),
    @IdMaria UNIQUEIDENTIFIER = (SELECT IdAluno FROM tbAlunos WHERE Nome = 'Maria Oliveira');

-- Criando tabela de presenças
CREATE TABLE tbPresencas (
    IdPresenca UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    IdAluno UNIQUEIDENTIFIER NOT NULL,
    IdTurma UNIQUEIDENTIFIER NOT NULL,
    DataAula DATE NOT NULL,
    Presente BIT NOT NULL, -- 1 = Presente, 0 = Falta
    FOREIGN KEY (IdAluno) REFERENCES tbAlunos(IdAluno),
    FOREIGN KEY (IdTurma) REFERENCES tbTurmas(IdTurma)
);

-- Inserindo presenças
INSERT INTO tbPresencas (IdAluno, IdTurma, DataAula, Presente)
VALUES
(@IdLaura, @IdTurma8, '2025-10-20', 1),
(@IdLaura, @IdTurma8, '2025-10-22', 0),
(@IdMauro, @IdTurma7, '2025-10-22', 1),
(@IdCarlos, @IdTurma9, '2025-10-20', 1),
(@IdCarlos, @IdTurma9, '2025-10-21', 1),
(@IdMaria, @IdTurma9, '2025-10-20', 0),
(@IdMaria, @IdTurma9, '2025-10-21', 0);

-- Criando tabela de notas
CREATE TABLE tbNotas (
    IdNota UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    IdAluno UNIQUEIDENTIFIER NOT NULL,
    Avaliacao NVARCHAR(150) NOT NULL,
    DataAvaliacao DATE NOT NULL,
    Nota DECIMAL(5,2) NOT NULL,
    CONSTRAINT FK_Notas_Alunos FOREIGN KEY (IdAluno) REFERENCES tbAlunos(IdAluno)
);

-- Inserindo notas
INSERT INTO tbNotas (IdAluno, Avaliacao, DataAvaliacao, Nota)
VALUES
(@IdLaura, N'Prova de Matemática', '2025-10-10', 8.50),
(@IdLaura, N'Trabalho de Ciências', '2025-10-18', 9.00),
(@IdMauro, N'Prova de História', '2025-10-12', 7.00),
(@IdMauro, N'Prova de Matemática', '2025-10-25', 6.50),
(@IdCarlos, N'Prova de Português', '2025-10-15', 8.00),
(@IdCarlos, N'Prova de Matemática', '2025-10-25', 7.50),
(@IdMaria, N'Prova de Português', '2025-10-15', 9.00),
(@IdMaria, N'Prova de Matemática', '2025-10-25', 8.75);

ALTER TABLE tbPresencas
ADD CONSTRAINT UQ_Presenca_Dia
UNIQUE (IdAluno, IdTurma, DataAula);

-- Consultas finais
SELECT * FROM tbTurmas;
SELECT * FROM tbAlunos;
SELECT * FROM tbPresencas;
SELECT * FROM tbNotas;
