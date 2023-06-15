using System;
using System.IO;
using System.Text.Json.Serialization;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace UsersEditor.Models {
    public class User {
        [JsonProperty("id")]
        [Required]
        [Range(0, int.MaxValue)]
        public int id { get; set; }

        [JsonProperty("login")]
        [Required]
        public string login { get; set; }

        [JsonProperty("password")]
        [Required]
        public string password { get; set; }

        [JsonProperty("name")]
        [Required]
        public string name { get; set; }

        [JsonProperty("type_id")]
        [Required]
        [Range(0, int.MaxValue)]
        public int typeId { get; set; }

        [JsonProperty("last_visit_date")]
        [Required]
        public DateTime lastVisitDate { get; set; }

        private static string usersFilePath = Environment.CurrentDirectory + "\\Resources\\Users.json"; 

        private static List<User> users;

        public static List<User> GetAllUsers() {
            if (users != null)
            {
                return users;
            }

            try {
                using (StreamReader reader = new StreamReader(usersFilePath))
                {
                    string usersJson = reader.ReadToEnd();
                    users = JsonConvert.DeserializeObject<List<User>>(usersJson);
                }
              
                return users;
            }  catch(Exception e) {
                Console.WriteLine(e);
                return new List<User>();
            }
        }

        public static bool SaveUsers()
        {
            try {
                users = users.OrderBy(o => o.id).ToList();
                StreamWriter writer = new StreamWriter(usersFilePath);
                string json = JsonConvert.SerializeObject(users, Formatting.Indented);
                writer.Write(json);
                writer.Close();
                return true;
            } catch(Exception e)  {
                Console.WriteLine(e);
                return false;
            }
        }

    }
}
