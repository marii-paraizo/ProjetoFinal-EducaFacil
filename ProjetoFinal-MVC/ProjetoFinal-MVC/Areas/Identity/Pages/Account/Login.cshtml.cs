using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using ProjetoFinal_MVC.Data;

namespace ProjetoFinal_MVC.Areas.Identity.Pages.Account
{
    [AllowAnonymous]
    public class LoginModel : PageModel
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<LoginModel> _logger;

        public LoginModel(SignInManager<ApplicationUser> signInManager,
                          UserManager<ApplicationUser> userManager,
                          ILogger<LoginModel> logger)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _logger = logger;
        }

        [BindProperty]
        public InputModel Input { get; set; }

        public string ReturnUrl { get; set; }

        public class InputModel
        {
            [Required(ErrorMessage = "O email é obrigatório.")]
            [EmailAddress(ErrorMessage = "Email inválido.")]
            [Display(Name = "Email")]
            public string Email { get; set; }

            [Required(ErrorMessage = "A senha é obrigatória.")]
            [DataType(DataType.Password)]
            [Display(Name = "Senha")]
            public string Password { get; set; }

            [Display(Name = "Lembrar-me?")]
            public bool RememberMe { get; set; }
        }

        public async Task OnGetAsync(string returnUrl = null)
        {
            if (!string.IsNullOrEmpty(returnUrl))
            {
                ReturnUrl = returnUrl;
            }
            else
            {
                ReturnUrl = Url.Content("~/Home/Dashboard");
            }

            await _signInManager.SignOutAsync();
        }

        public async Task<IActionResult> OnPostAsync(string returnUrl = null)
        {
            returnUrl ??= Url.Content("~/Home/Dashboard");

            if (ModelState.IsValid)
            {
                var result = await _signInManager.PasswordSignInAsync(
                    Input.Email,
                    Input.Password,
                    Input.RememberMe,
                    lockoutOnFailure: false);

                if (result.Succeeded)
                {
                    _logger.LogInformation("Usuário logado com sucesso.");
                    return LocalRedirect(returnUrl);
                }

                if (result.RequiresTwoFactor)
                {
                    return RedirectToPage("./LoginWith2fa", new { ReturnUrl = returnUrl, RememberMe = Input.RememberMe });
                }

                if (result.IsLockedOut)
                {
                    _logger.LogWarning("Conta de usuário bloqueada.");
                    return RedirectToPage("./Lockout");
                }

                ModelState.AddModelError(string.Empty, "Usuário ou senha inválidos.");
                return Page();
            }

            return Page();
        }
    }
}