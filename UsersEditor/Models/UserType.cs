using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace UsersEditor.Models {
    public class UserType {
        [JsonProperty("id")]
        public int id { get; set; }
        [JsonProperty("name")]
        public string name { get; set; }
        [JsonProperty("allow_edit")]
        public bool allowEdit { get; set; }

        private static string userTypesFilePath = Environment.CurrentDirectory + "\\Resources\\UserTypes.json"; 

        private static List<UserType> userTypes;

        public static List<UserType> GetAllUserTypes()
        {
            if (userTypes != null)
            {
                return userTypes;
            }

            try
            {
                StreamReader reader = new StreamReader(userTypesFilePath);
                string userTypesJson = reader.ReadToEnd();
                reader.Close();
                userTypes = JsonConvert.DeserializeObject<List<UserType>>(userTypesJson);
                return userTypes;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return new List<UserType>();//??
            }
        }

        public static string GetTypeNameById(int id)
        {
            if (userTypes == null)
            {
                return null;//??
            }

            UserType type = userTypes.Find(x => x.id == id);
            if (type == null)
            {
                return null;
            }
            return type.name;
        }
    }
}
