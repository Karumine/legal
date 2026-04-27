using LegalApi.Models;
using Microsoft.EntityFrameworkCore;

namespace LegalApi.Data
{
    public class LegalDbContext : DbContext
    {
        public LegalDbContext(DbContextOptions<LegalDbContext> options) : base(options)
        {
        }

        public DbSet<Contract> Contracts { get; set; }
        public DbSet<Party> Parties { get; set; }
        public DbSet<ContractItem> ContractItems { get; set; }
        public DbSet<Guarantor> Guarantors { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Additional configuration if needed
            modelBuilder.Entity<Contract>()
                .HasOne(c => c.Party1)
                .WithMany()
                .HasForeignKey(c => c.Party1Id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Contract>()
                .HasOne(c => c.Party2)
                .WithMany()
                .HasForeignKey(c => c.Party2Id)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
