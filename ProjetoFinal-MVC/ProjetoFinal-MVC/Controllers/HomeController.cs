using Microsoft.AspNetCore.Mvc;
using ProjetoFinal_MVC.Models;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;

namespace ProjetoFinal_MVC.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            ViewData["HideNavAndFooter"] = false;
            return View();
        }

        public IActionResult Login()
        {
            ViewData["HideNavAndFooter"] = true;
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
        
        public IActionResult Dashboard()
        {
            ViewData["HideNavAndFooter"] = false;
            return View("~/Views/Pg-Inicial/Dashboard.cshtml");
        }
    }
}
