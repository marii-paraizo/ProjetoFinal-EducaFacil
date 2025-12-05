using System.ComponentModel.DataAnnotations;

namespace ProjetoFinal_MVC.Models.InputModels
{
    public class TurmaInputModel
    {
        [Required(ErrorMessage = "O nome da turma é obrigatório.")]
        [StringLength(50, ErrorMessage = "O nome deve ter no máximo 50 caracteres.")]
        public string? Nome { get; set; }

        [Required(ErrorMessage = "O ano letivo é obrigatório.")]
        [Range(2000, 2100, ErrorMessage = "O ano letivo deve estar entre {1} e {2}.")]
        public int AnoLetivo { get; set; }
    }
}
