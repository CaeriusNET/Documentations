# Usages

On this page, we will see how to use Caerius.NET in your project, with different examples.  

Cause every project is different, we take the part where the lector is attentive with the best practices, and have some good knowledge of C# and TSQL.

For C# :
 - Knowledge about C# 12 and .NET 8 is required.  
 - Knowledge about `Good Practices`, `Clean Code`, `SOLID Principles`, `Repository Pattern`, `Dependency Injection` is recommended.  
 - Knowledge about `Records` and `Sealed Classes` is recommended.  

  
For TSQL :  
- Knowledge about TSQL is required.  
- Knowledge about `Stored Procedures` is required.  
- Knowledge about `Transactions` is recommended.  
- For advanced usage, knowledge about `Table-Valued Parameters` is recommended.

## C# : Repository
On your C# application, you should have specified class to handle the database operations.  
In clean code architecture, it's named an `Repositories` folder, who list each `Repository` class that will handle the database operations, attached to an `Interface`.

Let's take a look at this `Interface` and `Record` example :  

::: code-group
```csharp [Interface (Mandatory)]
namespace TestProject.Repositories.Interfaces;

public interface ICustomUsersRepository
{
    Task<IEnumerable<CustomUsersDto>> GetCustomUsersOlderThanAsync(byte age);
    Task UpdateCustomUserAgeByGuidAsync(Guid guid, byte age);
}
```
```csharp [Class]
namespace TestProject.Repositories;

public sealed class CustomUsersRepository(ICaeriusDbConnectionFactory Caerius)
    : ICustomUsersRepository
{
    public async Task<IEnumerable<CustomUsersDto>> GetCustomUsersOlderThanAsync(byte age)
    {
        throw new NotImplementedException();
    }

    public async Task UpdateCustomUserAgeByGuidAsync(Guid guid, byte age)
    {
        throw new NotImplementedException();
    }
}
```
```csharp [Record (Recommended)]
namespace TestProject.Repositories;

public sealed record CustomUsersRepository(ICaeriusDbConnectionFactory Caerius)
    : ICustomUsersRepository
{
    public async Task<IEnumerable<CustomUsersDto>> GetCustomUsersOlderThanAsync(byte age)
    {
        throw new NotImplementedException();
    }

    public async Task UpdateCustomUserAgeByGuidAsync(Guid guid, byte age)
    {
        throw new NotImplementedException();
    }
}
```
:::

We basically have an `Interface` that defines the methods that will be implemented in the `Repository` class.
 - One for the `Read` (`SELECT`) operations.
 - One for the `Write` (`INSERT INTO`, `DELETE`, `UPDATE`) operations.

In the below section, we will see how to implement the `Read` and `Write` operations.  

## Read Operations :

The `Read` operations are the `SELECT` operations.  
To implement the `GetCustomUsersOlderThanAsync` method, we need to follow these steps :
 - Start on the `TSQL` side, by creating a `Stored Procedure`.  
 - Turn to the `C#` side, by creating the C# DTO Mapping.  
 - Continue with C# by implementing the `GetCustomUsersOlderThanAsync` with the usage of the `StoredProcedureParametersBuilder` class.  

## TSQL : Stored Procedure

You need to create a Stored Procedure that will return the same columns as your DTO.

To make it possible, you need to use the `SELECT` statement with the same column names as your DTO properties, you can use aliases to match the column names.

```sql
CREATE PROCEDURE dbo.sp_GetCustomUsers_By_Age
    @Age TINYINT = 18
AS
BEGIN
    SET NOCOUNT ON
    SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
    
    BEGIN TRY
        BEGIN TRANSACTION
        
            SELECT
                myColumnGuid AS Guid,
                myColumnId AS Id,
                myColumnUsername AS Username,
                myColumnAge Age,
                myColumnCreatedAt CreatedAt,
                myColumnPoints Points
            FROM
                dbo.Users
            WHERE
                Age >= @Age
        
        IF @@TRANCOUNT > 0
            COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION
    END CATCH
END
```

### Explanations

To explain this Stored Procedure example, we are using aliases to match the column names of our DTO.  
For people who are surprised by the absence of `AS` keyword, it's optional in TSQL.  
In any case, those usages are working the same way, chosen one that you prefer.

Cautious, here we use the default schema `dbo`, it's highly recommended to use your own schema for your Stored Procedures.  

## C# : DTO Mapping

We heavy recommend to use [`sealed`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/sealed) [`records`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/record) for your DTOs.  
The reasons are :
- Specified by the `sealed` keyword, records cannot be inherited.
- Records are immutable.
- Records are lightweight.
- Records override by nature the `Equals` and `GetHashCode` methods.
- Records use by default the [`Primary Constructor`](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/tutorials/primary-constructors).
- Records are easy to read and to use.

You need to use the `ISpMapper<T>` interface to map the result of your Stored Procedure to your DTO.

```csharp
namespace TestProject.Models.Dtos;

public sealed record CustomUsersDto(
    Guid Guid,
    int Id,
    string Username,
    byte Age,
    DateTime CreatedAt,
    ushort Points)
    : ISpMapper<CustomUsersDto>
{
    public static CustomUsersDto MapFromReader(SqlDataReader reader)
    {
        return new CustomUsersDto(
            Guid = reader.GetGuid(0),
            Id = reader.GetInt32(1),
            Username = reader.GetString(2),
            Age = reader.GetByte(3),
            CreatedAt = reader.GetDateTime(4),
            Points = reader.GetUInt16(5)
        );
    }
}
```
### Explanations

To explain the `ISpMapper<T>` interface, it's a simple interface that contains a `MapFromReader` method.
This method will be used to map the result of the Stored Procedure to the DTO.

The [`SqlDataReader`](https://learn.microsoft.com/en-us/dotnet/api/microsoft.data.sqlclient.sqldatareader?view=sqlclient-dotnet-standard-5.2) object is used to read the result of the Stored Procedure,
using the stream of data returned by the SQL Server from the [`TDS (Tabular Data Stream) protocol`](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/b46a581a-39de-4745-b076-ec4dbb7d13ec).  

Because it's working like a buffer, you need to specify the index of the column you want to read, and the type of the column you want to read.  

This help to map correctly the result of the Stored Procedure to the DTO.

## C# : Stored Procedure Builder

It's the following step after making the `Repository` class, [C# : Repository](#c-repository).

On the example below, we will implement the `GetCustomUsersOlderThanAsync` method.

```csharp
namespace TestProject.Repositories;

public sealed record CustomUsersRepository(ICaeriusDbConnectionFactory Caerius)
    : ICustomUsersRepository
{
    public async Task<IEnumerable<CustomUsersDto>> GetCustomUsersOlderThanAsync(byte userAge)
    {
        var spParams = new StoredProcedureParametersBuilder("dbo.sp_GetCustomUsers_By_Age", 450)
            .AddParameter("Age", userAge, SqlDbType.TinyInt);

        var users = await Caerius.QueryAsync<CustomUsersDto>(spParams);

        return users;
    }
}
```

### Explanations

To explain the `StoredProcedureParametersBuilder` class, it's a class that will help you to build the parameters of the Stored Procedure.  

You need to specify the name of the Stored Procedure and the List Capacity, because behind the scene, we are using a `List<T>` to store the result of the Stored Procedure.  
You need to be the most accurate as possible to the number of rows that will be returned by the Stored Procedure.  
Check our [Benchmarks](https://caerius.net/benchmarks) to see the impact of the List Capacity.

After that, you need to add the parameters of the Stored Procedure, with the name of the parameter, the value of the parameter, and the type of the parameter.  



## Write Operations :

The `Write` operations are the `INSERT INTO`, `DELETE`, `UPDATE`, `MERGE` operations.  

To implement the `UpdateCustomUserAgeByGuidAsync` method, we need to follow these steps :
 - Start on the `TSQL` side, by creating a `Stored Procedure`.  
 - Back to the `C#` side, by implementing the `UpdateCustomUserAgeByGuidAsync` with the usage of the `StoredProcedureParametersBuilder` class.


## TSQL : Stored Procedure

You need to create a Stored Procedure for the `INSERT`, `UPDATE` or `DELETE` operations, here we will see the `UPDATE` operation.  

For this specific example, we will update the `Age` of a user by his `Guid`, with the possibility to use multiple parameters.  

```sql
CREATE PROCEDURE dbo.sp_UpdateCustomUserAge_By_Guid
    @Guid UNIQUEIDENTIFIER,
    @Age TINYINT
AS
BEGIN
    SET NOCOUNT ON
    SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
    
    BEGIN TRY
        BEGIN TRANSACTION
        
            UPDATE dbo.Users
            SET Age = @Age
            WHERE Guid = @Guid
        
        IF @@TRANCOUNT > 0
            COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION
    END CATCH
END
```

## C# : Stored Procedure Builder

It's the following step after making the `Repository` class, [4. C# : Repository](#_4-c-repository).

On the example below, we will implement the `UpdateCustomUserAgeByGuidAsync` method, based on the `Stored Procedure` we have created.  
With this method we are required to define the `Guid` and the `Age` parameters.
::: code-group
```csharp [With Affected Rows]
namespace TestProject.Repositories;

public sealed record CustomUsersRepository(ICaeriusDbConnectionFactory Caerius)
    : ICustomUsersRepository
{

    public async Task<int> UpdateCustomUserAgeByGuidAsync(Guid userGuid, byte userAge)
    {
        var spParams = new StoredProcedureParametersBuilder("dbo.sp_UpdateCustomUserAge_By_Guid")
            .AddParameter("Guid", userGuid, SqlDbType.UniqueIdentifier)
            .AddParameter("Age", userAge, SqlDbType.TinyInt);

        var rows = await Caerius.ExecuteAsync(spParams);
        
        return rows;
    }
}
```
```csharp [Without Affected Rows]
namespace TestProject.Repositories;

public sealed record CustomUsersRepository(ICaeriusDbConnectionFactory Caerius)
    : ICustomUsersRepository
{

    public async Task UpdateCustomUserAgeByGuidAsync(Guid userGuid, byte userAge)
    {
        var spParams = new StoredProcedureParametersBuilder("dbo.sp_UpdateCustomUserAge_By_Guid")
            .AddParameter("Guid", userGuid, SqlDbType.UniqueIdentifier)
            .AddParameter("Age", userAge, SqlDbType.TinyInt);

        return await Caerius.ExecuteScalarAsync(spParams);
    }
}
```

### Explanations

To explain the `ExecuteAsync` and `ExecuteScalarAsync` methods, they are used to execute the Stored Procedure, as `Fire and Forget`.
 - `ExecuteAsync` is used for `INSERT INTO`, `DELETE`, `UPDATE`, `MERGE` operations,  
and _**will not**_ return the number of rows affected by the operation.

 - `ExecuteScalarAsync` is used for `INSERT INTO`, `DELETE`, `UPDATE`, `MERGE` operations,  
and _**will**_ return the number of rows affected by the operation.  

**Note** : You don't have to specify the `List Capacity` for the `ExecuteAsync` and `ExecuteScalarAsync` methods, because they are not returning a `List<T>`.





