namespace ProjetoFinal_MVC.Models.ViewModels
{
    public class TurmaViewModel
    {
        public Guid IdTurma { get; set; }
        public string? Nome { get; set; }
        public int AnoLetivo { get; set; }
        public int QuantidadeAlunos { get; set; }
    }
}
