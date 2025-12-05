using Microsoft.AspNetCore.Identity;

namespace ProjetoFinal_MVC.Data
{
    public class ApplicationUser : IdentityUser
    {
        public string Nome { get; set; } = string.Empty;
        public string? FotoPerfil { get; set; }
    }
}
