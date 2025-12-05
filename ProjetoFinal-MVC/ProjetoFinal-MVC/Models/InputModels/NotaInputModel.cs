using System.ComponentModel.DataAnnotations;

namespace ProjetoFinal_MVC.Models.InputModels
{
    public class NotaInputModel
    {
        public Guid IdNota { get; set; }

        [Required(ErrorMessage = "O ID do aluno é obrigatório.")]
        public Guid IdAluno { get; set; }

        [Required(ErrorMessage = "O campo 'Avaliação' é obrigatório.")]
        [StringLength(100, ErrorMessage = "A descrição da avaliação deve ter no máximo 100 caracteres.")]
        public string Avaliacao { get; set; }

        [Required(ErrorMessage = "A data da avaliação é obrigatória.")]
        public DateOnly DataAvaliacao { get; set; }

        [Required(ErrorMessage = "O campo 'Nota' é obrigatório.")]
        [Range(0.0, 10.0, ErrorMessage = "A nota deve estar entre 0.0 e 10.0.")]
        public decimal Nota { get; set; }
    }
}
