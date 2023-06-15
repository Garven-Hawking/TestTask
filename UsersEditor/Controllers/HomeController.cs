using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using UsersEditor.Models;

namespace UsersEditor.Controllers {
    public class HomeController : Controller {

        public IActionResult Index() {
            List<User> users = Models.User.GetAllUsers();

            return View(users);
        }

        [HttpPost]
        public JsonResult GetUserTypes() {
             IEnumerable<UserType> types = Models.UserType.GetAllUserTypes();
            return Json(types);
        }

        [HttpPost]
        public JsonResult GetFilteredUsers(UsersFilter filter) {
            
            IEnumerable<User> filteredUsers = Models.User.GetAllUsers().Where(x => 
                    (filter.name == null || x.name.Contains(filter.name, StringComparison.CurrentCultureIgnoreCase)) &&
                    (filter.typeId == 0 || x.typeId == filter.typeId) &&
                    (filter.fromDate <= x.lastVisitDate) &&
                    (filter.untilDate == DateTime.MinValue || filter.untilDate >= x.lastVisitDate)    
            );

            return Json(filteredUsers);
        }

        [HttpPost]
        public IActionResult SaveChanges(User user)
        {
            if(!ModelState.IsValid)
            {
                return BadRequest("Проверьте корректность введенных данных");
            }
            List<User> users = Models.User.GetAllUsers();

            int index = users.IndexOf(users.Find(x => x.id == user.id));
            if (index == -1)
            {
                return BadRequest("Не удалось найти этого пользователя");
            }
            users[index] = user;

            return Ok("Изменено");
        }

        [HttpPost]
        public IActionResult DeleteUser(int id)
        {
            List<User> users = Models.User.GetAllUsers();
            User user = users.Find(x => x.id == id);
            if (user == null)
            {
                return BadRequest("Не удалось найти этого пользователя");
            }

            users.Remove(user);

            return Ok("Успешно удалено");
        }

        [HttpPost]
        public IActionResult AddUser(User user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Проверьте корректность введенных данных");
            }
            List<User> users = Models.User.GetAllUsers();
            User candidate = users.Find(x => x.id == user.id);
            if (candidate != null)
            {
                return BadRequest("С таким идентификаторм пользователь уже существеут");
            }

            users.Add(user);

            return Ok("Добавлено");
        }

        [HttpPost]
        public IActionResult SaveUsers() {
            bool res = Models.User.SaveUsers();
            if (!res)
            {
                StatusCode(500, "Ошибка сохранения");
            }
            return Ok("Успешно сохранено");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error() {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
