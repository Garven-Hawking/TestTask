using System;

namespace UsersEditor.Models
{
    public class UsersFilter
    {
        public string name { get; set; }
        public int typeId { get; set; }
        public DateTime fromDate { get; set; }
        public DateTime untilDate { get; set; }
    }
}
