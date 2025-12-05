namespace ProjetoFinal_MVC.Models.ViewModels
{
    public class AlunoViewModel
    {
        public Guid IdAluno { get; set; }
        public string Nome { get; set; }
        public string Rm { get; set; }
        public DateOnly DataNascimento { get; set; }
        public string NomeTurma { get; set; }
        public Guid IdTurma { get; set; }
    }
}
