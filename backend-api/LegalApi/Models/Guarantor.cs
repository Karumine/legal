using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LegalApi.Models
{
    public class Guarantor
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid ContractId { get; set; }
        [ForeignKey("ContractId")]
        public Contract Contract { get; set; } = null!;

        [Required]
        public string Name { get; set; } = string.Empty;

        public string? IdCard { get; set; }
        public string? Address { get; set; }
        public string? PostalCode { get; set; }
        public string? Phone { get; set; }
        public string? Type { get; set; } // 'person' | 'company'
        public string? Directors { get; set; } // For company guarantor

        public bool IsMarried { get; set; }
        public string? SpouseName { get; set; }
        public string? SpouseIdCard { get; set; }
        public string? SpouseAddress { get; set; }
        public string? SpousePostalCode { get; set; }

        public string? MetadataJson { get; set; }
    }
}
