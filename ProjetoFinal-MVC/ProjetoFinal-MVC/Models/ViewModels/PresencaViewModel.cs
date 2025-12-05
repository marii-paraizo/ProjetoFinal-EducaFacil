using System.ComponentModel.DataAnnotations;

namespace ProjetoFinal_MVC.Models.ViewModels
{
    public class PresencaViewModel
    {
        public Guid IdPresenca { get; set; }
        public Guid IdAluno { get; set; }
        public Guid IdTurma { get; set; }
        public DateOnly DataAula { get; set; }
        public bool Presente { get; set; }

        [Display(Name = "Aluno")]
        public string NomeAluno { get; set; }

        [Display(Name = "RM")]
        public string Rm { get; set; }
    }
}
