using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LegalApi.Models
{
    public class Party
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Name { get; set; } = string.Empty;

        public string? TaxId { get; set; }
        public string? Address { get; set; }
        public string? PostalCode { get; set; }
        public string? Directors { get; set; } // Can store as comma-separated or JSON string
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? ContactPerson { get; set; }

        public string? EntityType { get; set; } // 'company', 'partnership', 'person'
    }
}
