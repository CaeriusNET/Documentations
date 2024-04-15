# Getting Started
The pre-requisites for using Caerius.NET are:  
- C# .NET 8.0 or higher
- SQL Server 2022 or higher

If the pre-requisites are met, you can install Caerius.NET and start using it in your project.

## Installation
To install Caerius.NET, you can use the NuGet package manager in your favorite IDE or via the .NET CLI.

```bash
dotnet add package Caerius.NET
```

After installing the package, you can start using Caerius.NET in your project.

## Configuration
To configure Caerius.NET, you need to open your C# project and add the following configuration to the `appsettings.json` file:  

### Setting up the connection string
```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost,1433;Database=sandbox;User Id=sa;Password=HashedPassword!;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;" // [!code focus]
    "Template": "Server=<>;Database=<>;User Id=<>;Password=<>;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;" // [!code focus]
  }
}
```

::: details
* The `Template` connection string is used to create a new connection string for a new database. Replace the placeholders`<>` with the actual values.
* You can use : https://www.connectionstrings.com/sql-server/ to generate a connection string for your SQL Server.
* Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True; are important for the connection to work properly, cause of `Microsoft.Data.SqlClient`.
:::

That include the usage of `Microsoft.Extensions.Configuration.Json` package to read the configuration from the `appsettings.json` file.

### Setting up the Program.cs
On your `Program.cs` file,  
you need to register us in your `ServiceCollection` with the usage of `Dependency Injection`,  with this code : `.RegisterCaeriusNet(connectionString);`

You can use the code below as an example to register Caerius.NET in your project:

```csharp
using CaeriusNet.Extensions;
using Microsoft.Extensions.Configuration;

var services = new ServiceCollection();

var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", true, true)
    .Build();

services.AddSingleton<IConfiguration>(configuration);

var connectionString = configuration.GetConnectionString("<>");

services // [!code focus] 
    .RegisterCaeriusNet(connectionString); // [!code focus]
    // ... the rest of your DI configuration // [!code --]

var serviceProvider = services.BuildServiceProvider();
```

### How to use Caerius.NET
After configuring Caerius.NET, on your `DI`, you can start using it in your `Repository` classes.
::: details
* In the example below, we are using some clean architecture principles, like :  
`SOLID Principles`, `Repository Pattern` and `Dependency Injection` 
* The `Repository` class is responsible for handling the database operations.
:::

::: code-group
```csharp [Classes]
namespace TestProject.Repositories;

public interface ITestRepository
{
    Task<ImmutableArray<UsersDto>> GetUsersOlderThanAsync(int usersAge);
}

public sealed class TestRepository(ICaeriusDbConnectionFactory Caerius) : ITestRepository
{

    public async Task<IEnumerable<UsersDto>> GetUsersOlderThanAsync(int usersAge)
    {
        var spParams = new StoredProcedureParametersBuilder("dbo.sp_GetUser_By_Age")
            .AddParameter("Age", usersAge, SqlDbType.Int)

        var users = await Caerius.QueryAsync<UsersDto>(spParams);

        return users;
    }
}
```
```csharp [Records (Recommended)]
namespace TestProject.Repositories;

public interface ITestRepository
{
    Task<ImmutableArray<UsersDto>> GetUsersOlderThanAsync(int usersAge);
}

public sealed record TestRepository(ICaeriusDbConnectionFactory Caerius) : ITestRepository
{

    public async Task<IEnumerable<UsersDto>> GetUsersOlderThanAsync(int usersAge)
    {
        var spParams = new StoredProcedureParametersBuilder("dbo.sp_GetUser_By_Age")
            .AddParameter("Age", usersAge, SqlDbType.Int)

        var users = await Caerius.QueryAsync<UsersDto>(spParams);

        return users;
    }
}
```
:::

And now the DTO classes we are using here :
::: code-group
```csharp [Classes]
namespace TestProject.Models.Dtos;

public sealed class UsersDto : ISpMapper<UsersDto>
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required byte Age { get; set; }
    
    public static UsersDto MapFromReader(SqlDataReader reader)
    {
        return new UsersDto
        {
            Id = reader.GetInt32(0),
            Name = reader.GetString(1),
            Age = reader.GetByte(2)
        };
    }
}
```
```csharp [Records (Recommended)]
namespace TestProject.Models.Dtos;

public sealed record UsersDto(int Id, string Name, byte Age)
    : ISpMapper<UsersDto>
    
    public static UsersDto MapFromReader(SqlDataReader reader)
    {
        return new UsersDto
        {
            Id = reader.GetInt32(0),
            Name = reader.GetString(1),
            Age = reader.GetByte(2)
        };
    }
}
```