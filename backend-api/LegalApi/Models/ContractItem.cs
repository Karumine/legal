using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LegalApi.Models
{
    public class ContractItem
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid ContractId { get; set; }
        [ForeignKey("ContractId")]
        public Contract Contract { get; set; } = null!;

        public string? AgreementId { get; set; }
        public string? ItemType { get; set; }
        public string? ContractNoRef { get; set; }
        public DateTime? RefDate { get; set; }
        public string? Description { get; set; }
        public string? Quantity { get; set; }
        public string? Unit { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal Amount { get; set; }
        public decimal Rate { get; set; }

        public string? MetadataJson { get; set; }
    }
}
