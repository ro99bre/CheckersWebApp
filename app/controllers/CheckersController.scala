package controllers

import javax.inject._
import play.api._
import play.api.mvc._
import play.api.libs.streams.ActorFlow


import com.google.inject.Guice
import de.htwg.se.checkers.CheckersModule
import de.htwg.se.checkers.control.ControllerComponent.ControllerTrait
import de.htwg.se.checkers.util.Observer

import akka.actor.ActorSystem
import akka.stream.Materializer
import akka.actor._


@Singleton
class CheckersController @Inject()(val controllerComponents: ControllerComponents) (implicit system: ActorSystem, mat: Materializer) extends BaseController {

    val injector = Guice.createInjector(new CheckersModule)
    val controller = injector.getInstance(classOf[ControllerTrait])

    controller.createGame()
    
    def index() = Action { implicit request: Request[AnyContent] =>
        Ok(views.html.index())
    }

    def printGame() = Action { implicit request: Request[AnyContent] =>
        Ok(controller.gameToString)
    }

    def jsonGame() = Action { implicit request: Request[AnyContent] =>
        Ok(controller.gameToJson)
    }

    def move(sx: Int, sy: Int, dx: Int, dy: Int) = Action { implicit request: Request[AnyContent] =>
        controller.move(sx, sy, dx, dy)
        Ok(controller.gameToJson)
    }

    def undo() = Action { implicit request: Request[AnyContent] =>
        try {
            controller.undo()
            Ok(controller.gameToJson)
        }
        catch {
            case _: Throwable => println("Can not undo last move")
            Ok("Undo Failed")
        }
    }

    def redo() = Action { implicit request: Request[AnyContent] =>
        try {
            controller.redo()
            Ok(controller.gameToJson)
        }
        catch {
            case _: Throwable => println("Can not redo last move")
            Ok("Redo Failed")
        }
    }

    def save(fileName: String) = Action { implicit request: Request[AnyContent] =>
        try {
            controller.save("games/" + fileName + ".json")
            Ok(controller.gameToJson)
        }
        catch {
            case _: Throwable => println("Can not save game")
            Ok("Save Failed")
        }
    }

    def load(fileName: String) = Action { implicit request: Request[AnyContent] =>
        try {
            controller.load("games/" + fileName + ".json")
            Ok(controller.gameToJson)
        }
        catch {
            case _: Throwable => println("Can not load game / Loading file does not exist.")
            Ok("Load Failed")
        }
    }

    def startscreen() = Action { implicit request: Request[AnyContent] =>
        Ok(views.html.startscreen())
    }
    
    def tutorial() = Action { implicit request: Request[AnyContent] =>
        Ok(views.html.tutorial())
    }

    def newGame() = Action { implicit request: Request[AnyContent] =>
        controller.createGame()
        Ok(views.html.gameBoard())
    }

    def game() = Action { implicit request: Request[AnyContent] =>
        Ok(views.html.gameBoard())
    }

        
    object CheckersWebSocketActorFactory {
        def create(out: ActorRef) = {
        Props(new CheckersWebSocketActor(out))
        }
    }
    
    def socket() = WebSocket.accept[String, String] { _ =>
        ActorFlow.actorRef { out =>
            println("Connect received")
            CheckersWebSocketActorFactory.create(out)
        }
    }

    class CheckersWebSocketActor(out: ActorRef) extends Actor with Observer {

        controller.add(this)

        def receive : Actor.Receive = {
            case msg: String =>
                update()
                println("Sent Json to Client"+ msg)
        }

        def sendJsonToClient = {
            println("Received event from Controller")
            out ! (controller.gameToJson.toString)
        }
                        
        override def update(): Unit = {
            println("Updated field")
            sendJsonToClient
        }
    }
}
