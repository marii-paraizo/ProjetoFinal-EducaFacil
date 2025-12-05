namespace ProjetoFinal_MVC.Models.ViewModels
{
    public class NotaViewModel
    {
        public Guid IdNota { get; set; }
        public Guid IdAluno { get; set; }
        public string Avaliacao { get; set; }
        public DateOnly DataAvaliacao { get; set; }
        public decimal Nota { get; set; }
    }
}
