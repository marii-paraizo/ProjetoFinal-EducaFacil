using System.ComponentModel.DataAnnotations;

namespace ProjetoFinal_MVC.Models.InputModels
{
    public class PresencaInputModel
    {
        [Required]
        public Guid IdAluno { get; set; }

        [Required]
        public Guid IdTurma { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateOnly DataAula { get; set; }

        [Required]
        public bool Presente { get; set; }
    }
}
