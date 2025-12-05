using Microsoft.AspNetCore.Mvc;

namespace ProjetoFinal_MVC.Controllers
{
    public class PresencasController : Controller
    {
        private const string BaseApiUrlPresencas = "https://localhost:7126/api/Presencas";
        private const string BaseApiUrlTurmas = "https://localhost:7126/api/Turmas";
        private const string BaseApiUrlAlunos = "https://localhost:7126/api/Alunos";

        public IActionResult Index()
        {
            ViewBag.BaseApiUrlPresencas = BaseApiUrlPresencas;
            ViewBag.BaseApiUrlTurmas = BaseApiUrlTurmas;
            ViewBag.BaseApiUrlAlunos = BaseApiUrlAlunos;

            return View();
        }
    }
}