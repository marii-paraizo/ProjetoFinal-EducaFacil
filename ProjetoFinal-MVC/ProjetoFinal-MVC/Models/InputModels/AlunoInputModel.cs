using System.ComponentModel.DataAnnotations;

namespace ProjetoFinal_MVC.Models.InputModels
{
    public class AlunoInputModel
    {
        public Guid IdAluno { get; set; }

        [Required(ErrorMessage = "O nome é obrigatório.")]
        public string Nome { get; set; }

        [Required(ErrorMessage = "O RM é obrigatório.")]
        [RegularExpression("^[0-9]+$", ErrorMessage = "O RM deve conter apenas números.")]
        public string Rm { get; set; }

        [Required(ErrorMessage = "A data de nascimento é obrigatória.")]
        public DateOnly DataNascimento { get; set; }

        [Required]
        public Guid IdTurma { get; set; }
    }
}
